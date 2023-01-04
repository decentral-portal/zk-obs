import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection, Repository, In } from 'typeorm';
import { getDefaultObsOrderLeaf } from '../account/helper/mkAccount.helper';
import { toTreeLeaf, tsHashFunc } from '../common/ts-helper';
import { TsMerkleTree } from '../common/tsMerkleTree';
import { UpdateObsOrderTreeDto } from './dto/updateObsOrderTree.dto';
import { ObsOrderLeafEntity } from './obsOrderLeaf.entity';
import { ObsOrderLeafMerkleTreeNode } from './obsOrderLeafMerkleTreeNode.entity';

@Injectable()
export class ObsOrderTreeService extends TsMerkleTree<ObsOrderLeafEntity> {

  private logger: Logger = new Logger(ObsOrderTreeService.name);
  constructor(
    @InjectRepository(ObsOrderLeafEntity)
    private readonly obsOrderLeafRepository: Repository<ObsOrderLeafEntity>,
    @InjectRepository(ObsOrderLeafMerkleTreeNode)
    private readonly obsOrderMerkleTreeRepository: Repository<ObsOrderLeafMerkleTreeNode>,
    private readonly connection: Connection,
    private configService: ConfigService,
  ) {
    console.time('init order tree');
    super(configService.getOrThrow<number>('ORDER_TREE_HEIGHT'), tsHashFunc);
    console.timeEnd('init order tree');
    this.setLevelDefaultHash();
  }
  async updateLeaf(leafId: bigint, value: UpdateObsOrderTreeDto) {
    console.time('updateLeaf for obsOrder tree');
    const prf = this.getProofIds(leafId);
    const id = this.getLeafIdInTree(leafId);
    // setup transaction
    await this.connection.transaction(async (manager) => {
      await manager.upsert(ObsOrderLeafMerkleTreeNode, {
        id: id.toString(),
        leafId: leafId,
        hash: BigInt(toTreeLeaf([
          BigInt(value.txId),
          BigInt(value.reqType),
          BigInt(value.sender),
          BigInt(value.sellTokenId),
          BigInt(value.sellAmt),
          BigInt(value.nonce),
          BigInt(value.buyTokenId),
          BigInt(value.buyAmt),
          BigInt(value.accumulatedSellAmt),
          BigInt(value.accumulatedBuyAmt),
          BigInt(value.orderId)
        ]))
      }, ['id']);
      await manager.upsert(ObsOrderLeafEntity, {
        orderLeafId:BigInt(value.orderLeafId),
        txId: Number(value.txId),
        reqType: Number(value.reqType),
        sender: BigInt(value.sender),
        sellTokenId: BigInt(value.sellTokenId),
        sellAmt: BigInt(value.sellAmt),
        nonce: BigInt(value.nonce),
        buyTokenId: BigInt(value.buyTokenId),
        buyAmt: BigInt(value.buyAmt),
        accumulatedSellAmt: BigInt(value.accumulatedSellAmt),
        accumulatedBuyAmt: BigInt(value.accumulatedBuyAmt),
        orderId: Number(value.orderId)
      }, ['orderLeafId']);
      // update tree
      for (let i = id, j = 0; i > 1n; i = i >> 1n) {
        const [iValue, jValue] = await Promise.all([
          this.obsOrderMerkleTreeRepository.findOneBy({id: i.toString()}),
          this.obsOrderMerkleTreeRepository.findOneBy({id: prf[j].toString()})
        ]);
        const jLevel = Math.floor(Math.log2(Number(prf[j])));
        const iLevel = Math.floor(Math.log2(Number(i)));
        const jHashValue: string = (jValue == null)? this.getDefaultHashByLevel(jLevel): jValue.hash.toString();
        const iHashValue: string = (iValue == null)? this.getDefaultHashByLevel(iLevel): iValue.hash.toString();
        const r = (id % 2n == 0n) ?[ jHashValue, iHashValue] : [ iHashValue, jHashValue];
        const hash = this.hashFunc(r);
        const jobs = [];
        if (iValue == null) {
          jobs.push(manager.upsert(ObsOrderLeafMerkleTreeNode, {
            id: i.toString(),
            hash: BigInt(iHashValue)
          }, ['id']));
        } 
        if (jValue == null && j < prf.length) {
          jobs.push(manager.upsert(ObsOrderLeafMerkleTreeNode, {
            id: prf[j].toString(),
            hash: BigInt(jHashValue)
          }, ['id']));
        }
        const updateRoot = i >> 1n;
        if ( updateRoot >= 1n) {
          jobs.push(manager.upsert(ObsOrderLeafMerkleTreeNode, {
            id: updateRoot.toString(),
            hash: BigInt(hash)
          }, ['id']));
        }
        await Promise.all(jobs);
        j++;
      }
    });
    console.timeEnd('updateLeaf for obsOrder tree');
  }
  async getLeaf(leaf_id: bigint): Promise<ObsOrderLeafEntity | null> {
    const result = this.obsOrderLeafRepository.findOneBy({
      orderLeafId: leaf_id
    });
    if (result == null) {
      // check level
      const id = this.getLeafIdInTree(leaf_id);
      const level = Math.floor(Math.log2(Number(id)));
      const hash = this.getDefaultHashByLevel(level);
      // setup transaction
      await this.connection.transaction(async (manager) => {
        // insert this null hash on this node
        await manager.insert(ObsOrderLeafMerkleTreeNode, {
          leafId: leaf_id,
          id: id.toString(),
          hash: BigInt(hash),
        });
        await manager.insert(ObsOrderLeafEntity, {
          orderLeafId: leaf_id,
        });
      });
      return this.obsOrderLeafRepository.findOneBy({
        orderLeafId: leaf_id
      }); 
    }
    return result;
  }
  async getRoot() {
    const result = await this.obsOrderMerkleTreeRepository.findOne({
      where: {
        id: 1n.toString(),
      }       
    });
    if (result == null) {
      const hash = await this.getDefaultHashByLevel(1);
      await this.obsOrderMerkleTreeRepository.insert({
        id: 1n.toString(),
        hash: BigInt(hash),
      });
      return {
        id: 1n.toString(),
        hash: hash
      };
    }
    return {
      id: result.id,
      hash: result.hash.toString()
    };
  }
  getDefaultRoot(): string {
    return this.getDefaultHashByLevel(1);
  }
  getLeafDefaultVavlue(): string {
    // TODO: @abner please help me to check is the order is right?
    return getDefaultObsOrderLeaf();
  }


  async getMerklerProof(leafId: bigint): Promise<bigint[]> {
    const ids = this.getProofIds(leafId);
    const r = await this.obsOrderMerkleTreeRepository.find({
      where: {
        id: In(ids)
      },
      order: {
        id: 'ASC'
      }
    });
    return r.map(item => item.hash);
  }
}