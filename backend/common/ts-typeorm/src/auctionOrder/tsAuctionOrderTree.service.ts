import { Injectable, Logger } from '@nestjs/common';
import { getEntityManagerToken, InjectConnection, InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm/repository/Repository';
import { AuctionOrderTreeResponseDto } from '@common/ts-typeorm/account/dto/auctionOrderTreeResponse.dto';
import { TsTxAuctionBorrowRequest, TsTxAuctionCancelRequest, TsTxAuctionLendRequest } from '@common/ts-typeorm/account/dto/ts-req-types';
import { TsTxType } from '@common/ts-typeorm/account/dto/ts-type';
import { TsAuctionEmptyOrder } from '@common/ts-typeorm/account/dto/TxAuctionEmptyOrder.dto';
import { tsHashFunc } from '@common/ts-typeorm/common/ts-helper';
import { TsMerkleTree } from '@common/ts-typeorm/common/tsMerkleTree';
import { AuctionOrderLeafNode } from '@common/ts-typeorm/auctionOrder/auctionOrderLeafNode.entity';
import { AuctionOrderMerkleTreeNode } from '@common/ts-typeorm/auctionOrder/auctionOrderMerkleTreeNode.entity';
import { AuctionBorrowOrderStrategy } from '@common/ts-typeorm/auctionOrder/leaf-update-strategy/AuctionBorrowOrder.strategy';
import { AuctionCancelOrderStrategy } from '@common/ts-typeorm/auctionOrder/leaf-update-strategy/AuctionCancelOrder.strategy';
import { AuctionLendOrderStrategy } from '@common/ts-typeorm/auctionOrder/leaf-update-strategy/AuctionLendOrder.strategy';
import { AuctionOrderUpdater } from '@common/ts-typeorm/auctionOrder/leaf-update-strategy/AuctionOder.updater';
import { Connection } from 'typeorm';

const emptyOrder = new TsAuctionEmptyOrder();
@Injectable()
export class TsAuctionOrderTreeService extends TsMerkleTree<AuctionOrderLeafNode> {
  private logger: Logger = new Logger(TsAuctionOrderTreeService.name);
  private auctionOrderUpdater: AuctionOrderUpdater;
  constructor(
    @InjectRepository(AuctionOrderLeafNode)
    private readonly auctionOrderLeafRepository: Repository<AuctionOrderLeafNode>,
    @InjectRepository(AuctionOrderMerkleTreeNode)
    private readonly auctionOrderMerkleTreeRepository: Repository<AuctionOrderMerkleTreeNode>,
    private readonly connection: Connection,
  ) {
    console.time('init auction order tree');
    super(32, tsHashFunc);
    console.timeEnd('init auction order tree');
    this.auctionOrderUpdater = new AuctionOrderUpdater();
    this.auctionOrderUpdater.use(TsTxType.AUCTION_LEND, new AuctionLendOrderStrategy());
    this.auctionOrderUpdater.use(TsTxType.AUCTION_BORROW, new AuctionBorrowOrderStrategy());
    this.auctionOrderUpdater.use(TsTxType.AUCTION_CANCEL, new AuctionCancelOrderStrategy(
      this.auctionOrderLeafRepository
    ));
  }
  async getCurrentAuctionOrderId(): Promise<number> {
    return await this.auctionOrderLeafRepository.count();
  }
  getLeafDefaultVavlue(): string {
    return emptyOrder.encodeOrderLeaf();
  }
  async updateLeaf(leafId: bigint, value: TsTxAuctionLendRequest | TsTxAuctionBorrowRequest | TsTxAuctionCancelRequest, reqObject: { txId: bigint, reqType: TsTxType, orderId: number }): Promise<void> {
    console.time('updateLeaf for auction order tree');
    const time = Date.now();
    const prf = this.getProofIds(leafId);
    const id = this.getLeafIdInTree(leafId);
    const reqType: TsTxType = reqObject.reqType;
    const orderId = reqObject.orderId;
    const txId = reqObject.txId;
    
    await this.connection.transaction(async (manager) => {

      await this.auctionOrderUpdater.doUpdate(manager, reqType, value, orderId, txId, id);
      // update proof
      for (let i = id, j = 0; i > 1n ; i = i >> 1n) {
        const [iValue, jValue] = await Promise.all([
          this.auctionOrderMerkleTreeRepository.findOneBy({ id: i.toString()}),
          this.auctionOrderMerkleTreeRepository.findOneBy({ id: prf[j].toString()}),
        ]);
        const jLevel = Math.floor(Math.log2(Number(prf[j])));
        const iLevel = Math.floor(Math.log2(Number(i)));
        const jHashValue: string = (jValue == null) ? this.getDefaultHashByLevel(jLevel) : jValue.hash.toString();
        const iHashValue: string = (iValue == null) ? this.getDefaultHashByLevel(iLevel) : iValue.hash.toString();
        const r = (id % 2n == 0n) ? [iHashValue, jHashValue] : [jHashValue, iHashValue];
        const hash = tsHashFunc(r);
        const jobs = [];
        if (iValue == null) {
          jobs.push(manager.upsert(AuctionOrderMerkleTreeNode, {
            id: i.toString(),
            hash: BigInt(jHashValue),
          }, ['id']));
        }
        if (jValue == null && j < prf.length ) {
          jobs.push(manager.upsert(AuctionOrderMerkleTreeNode, {
            id: prf[j].toString(),
            hash: BigInt(iHashValue),
          }, ['id']));
        }
        const updateRoot = i >> 1n;
        if (updateRoot >= 1n) {
          jobs.push(manager.upsert(AuctionOrderMerkleTreeNode, {
            id: updateRoot.toString(),
            hash: BigInt(hash),
          }, ['id']));
        }
        await Promise.all(jobs);
        j++;
      }
    });
    console.timeEnd('updateLeaf for auction order tree');
  }

  async getLeaf(leaf_id: bigint): Promise<AuctionOrderLeafNode | null> {
    const result = await this.auctionOrderLeafRepository.findOneBy({ leafId: leaf_id.toString() });
    if (result == null) {
      // check level
      const id = this.getLeafIdInTree(leaf_id);
      const level = Math.floor(Math.log2(Number(id)));
      const hash = this.getDefaultHashByLevel(level);
      // insert this null hash on this node
      await this.connection.transaction(async (manager) => {
        await manager.insert(AuctionOrderLeafNode, {
          leafId: leaf_id.toString(),
        });
        await manager.insert(AuctionOrderMerkleTreeNode, {
          id: id.toString(),
          leafId: leaf_id,
          hash: BigInt(hash),
        });
      });
      return await this.auctionOrderLeafRepository.findOneBy({ leafId:leaf_id.toString()  });  
    }
    return result;
  }
  async getRoot(): Promise<AuctionOrderTreeResponseDto> {
    const result = await this.auctionOrderMerkleTreeRepository.findOneBy({ id: 1n.toString() });
    if (result == null) {
      const hash = this.getDefaultHashByLevel(1);
      await this.auctionOrderMerkleTreeRepository.insert({
        id: 1n.toString(),
        hash: BigInt(hash),
      });
      return {
        id: 1,
        leafId: null,
        hash: hash,
      };
    }
    const resultHash = result.hash.toString();
    return {
      id: 1,
      leafId: null,
      hash: resultHash,
    };
  }
}