import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection, Repository } from 'typeorm';
import { toTreeLeaf, tsHashFunc } from '../common/ts-helper';
import { TsMerkleTree } from '../common/tsMerkleTree';
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
    super(configService.get<number>('ORDER_TREE_HEIGHT', 32), tsHashFunc);
    console.timeEnd('init order tree');
  }
  updateLeaf(leafId: bigint, value: any, otherPayload: any): void {
    throw new Error('Method not implemented.');
  }
  getLeaf(leaf_id: bigint, otherPayload: any): Promise<ObsOrderLeafEntity | null> {
    throw new Error('Method not implemented.');
  }
  async getRoot() {
    const result = await this.obsOrderMerkleTreeRepository.findOne({
      where: {
        id: 1n,
      }       
    });
    if (result == null) {
      const hash = await this.getDefaultHashByLevel(1);
      await this.obsOrderMerkleTreeRepository.insert({
        id: 1n,
        hash: BigInt(hash),
      });
      return {
        id: 1n.toString(),
        hash: hash
      }
    }
    return {
      id: result.id,
      hash: result.hash.toString()
    };
  }
  getLeafDefaultVavlue(): string {
    // TODO: @abner please help me to check is the order is right?
    return toTreeLeaf([
      0n, // orderLeafId 
      0n, // txId
      0n, // reqType
      0n, // sender
      0n, // sellTokenId
      0n, // sellAmt
      0n, // buyTokenId
      0n, // buyAmt
      0n, // accumulatedSellAmt
      0n, // accumulatedBaseAmt
      0n, // orderId
    ]);
  }
}