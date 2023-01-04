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
  public currentOrderId = 1n;
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
    this.setCurrentOrderId();
  }
  async setCurrentOrderId() {
    await this.updateLeaf('0', {
      orderLeafId: '0',
      txId: '0',
      reqType: '0',
      sender: '0',
      sellTokenId: '0',
      sellAmt: '0',
      nonce: '0',
      buyTokenId: '0',
      buyAmt: '0',
      accumulatedSellAmt: '0',
      accumulatedBuyAmt: '0',
    });
    const last = await this.obsOrderLeafRepository.count({
      order: {
        orderLeafId: 'DESC'
      },
    });
    this.currentOrderId = BigInt(last) + 1n;
  }
  async addCurrentOrderId() {
    this.currentOrderId += 1n;
  }
  async updateLeaf(leafId: string, value: UpdateObsOrderTreeDto) {
    console.time('updateLeaf for obsOrder tree');
    const prf = this.getProofIds(leafId);
    const id = this.getLeafIdInTree(leafId);
    // setup transaction
    await this.connection.transaction(async (manager) => {
      await manager.upsert(ObsOrderLeafMerkleTreeNode, {
        id: id.toString(),
        leafId: leafId,
        hash: BigInt(toTreeLeaf([
          BigInt(value.reqType),
          BigInt(value.sender),
          BigInt(value.sellTokenId),
          BigInt(value.sellAmt),
          BigInt(value.nonce),
          0n, 0n,
          BigInt(value.buyTokenId),
          BigInt(value.buyAmt),
          0n,
          BigInt(value.txId),
          BigInt(value.accumulatedSellAmt),
          BigInt(value.accumulatedBuyAmt),
        ])).toString()
      }, ['id']);
      await manager.upsert(ObsOrderLeafEntity, {
        orderLeafId:(value.orderLeafId),
        txId: Number(value.txId),
        reqType: Number(value.reqType),
        sender: (value.sender),
        sellTokenId: (value.sellTokenId),
        sellAmt: (value.sellAmt),
        nonce: (value.nonce),
        buyTokenId: (value.buyTokenId),
        buyAmt: (value.buyAmt),
        accumulatedSellAmt: (value.accumulatedSellAmt),
        accumulatedBuyAmt: (value.accumulatedBuyAmt),
        // orderId: Number(value.orderId)
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
        const hashDecString = BigInt(this.hashFunc(r)).toString();
        const jobs = [];
        if (iValue == null) {
          jobs.push(manager.upsert(ObsOrderLeafMerkleTreeNode, {
            id: i.toString(),
            hash: (iHashValue)
          }, ['id']));
        } 
        if (jValue == null && j < prf.length) {
          jobs.push(manager.upsert(ObsOrderLeafMerkleTreeNode, {
            id: prf[j].toString(),
            hash: (jHashValue)
          }, ['id']));
        }
        const updateRoot = i >> 1n;
        if ( updateRoot >= 1n) {
          jobs.push(manager.upsert(ObsOrderLeafMerkleTreeNode, {
            id: updateRoot.toString(),
            hash: hashDecString
          }, ['id']));
        }
        await Promise.all(jobs);
        j++;
      }
    });
    console.timeEnd('updateLeaf for obsOrder tree');
  }
  async getLeaf(leaf_id: string): Promise<ObsOrderLeafEntity | null> {
    const result = this.obsOrderLeafRepository.findOneBy({
      orderLeafId: leaf_id
    });
    if (result == null) {
      // check level
      const id = this.getLeafIdInTree(leaf_id);
      const level = Math.floor(Math.log2(Number(id)));
      const hashDecString = BigInt(this.getDefaultHashByLevel(level)).toString();
      // setup transaction
      await this.connection.transaction(async (manager) => {
        // insert this null hash on this node
        await manager.insert(ObsOrderLeafMerkleTreeNode, {
          leafId: leaf_id,
          id: id.toString(),
          hash: hashDecString,
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
      const hashDecString = BigInt(this.getDefaultHashByLevel(1)).toString();
      await this.obsOrderMerkleTreeRepository.insert({
        id: 1n.toString(),
        hash: hashDecString,
      });
      return {
        id: 1n.toString(),
        hash: hashDecString
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


  async getMerklerProof(leafId: string): Promise<bigint[]> {
    const ids = this.getProofIds(leafId);
    const r = await this.obsOrderMerkleTreeRepository.find({
      where: {
        id: In(ids.map(id => id.toString()))
      },
      order: {
        id: 'ASC'
      }
    });
    return r.map(item => BigInt(item.hash));
  }
}