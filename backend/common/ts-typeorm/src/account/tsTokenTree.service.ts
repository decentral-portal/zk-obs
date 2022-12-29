import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';

import { Connection, IsNull, Not, Repository } from 'typeorm';
import { toTreeLeaf, tsHashFunc } from '../common/ts-helper';
import { TsMerkleTree } from '../common/tsMerkleTree';
import { TokenTreeResponseDto } from './dto/tokenTreeResponse.dto';
import { UpdateTokenTreeDto } from './dto/updateTokenTree.dto';
import { TokenLeafNode } from './tokenLeafNode.entity';
import { TokenMerkleTreeNode } from './tokenMerkleTreeNode.entity';
@Injectable()
export class TsTokenTreeService extends TsMerkleTree<TokenLeafNode> {
  private logger: Logger = new Logger(TsTokenTreeService.name);
  constructor(
    @InjectRepository(TokenLeafNode)
    private readonly tokenLeafRepository: Repository<TokenLeafNode>,
    @InjectRepository(TokenMerkleTreeNode)
    private readonly tokenMerkleTreeRepository: Repository<TokenMerkleTreeNode>,
    private readonly connection: Connection,
    private configService: ConfigService,
  ) {
    console.time('init token tree');
    super(configService.get<number>('TOKENS_TREE_HEIGHT', 2), tsHashFunc);
    console.timeEnd('init token tree');
  }
  async getCurrentLeafIdCount(accountId: bigint): Promise<number> {
    const leafIdCount = await this.tokenMerkleTreeRepository.count(
      {
        where: {
          accountId: accountId.toString(),
          leafId: Not(IsNull())
        }
      }
    );
    return leafIdCount;
  }
  getLeafDefaultVavlue(): string {
    return toTreeLeaf([0n, 0n, 0n]);
  }
  async updateLeaf(leafId: bigint, value: UpdateTokenTreeDto) {
    console.time('updateLeaf for token tree');
    const prf = this.getProofIds(leafId);
    const id = this.getLeafIdInTree(leafId);
    const leafHash = toTreeLeaf([BigInt(value.L2TokenAddr), BigInt(value.lockedAmt), BigInt(value.availableAmt)]);
    await this.connection.transaction(async (manager) => {
      const accountId = value.accountId;
      // update leaf
      await manager.upsert(TokenMerkleTreeNode, {
        accountId: accountId,
        id: id.toString(),
        leafId: leafId.toString(),
        hash: BigInt(leafHash)
      }, ['id', 'accountId']);
      await manager.upsert(TokenLeafNode, {
        leafId:  leafId.toString(),
        accountId: accountId,
        L2TokenAddr: BigInt(value.L2TokenAddr),
        lockedAmt: BigInt(value.lockedAmt),
        availableAmt: BigInt(value.availableAmt)       
      }, ['leafId', 'accountId']);
      // update proof
      for (let i = id, j = 0; i > 1n; i = i >> 1n) {
        const [iValue, jValue ]= await Promise.all([
          this.tokenMerkleTreeRepository.findOneBy({id: i.toString(), accountId: accountId}),
          this.tokenMerkleTreeRepository.findOneBy({id: prf[j].toString(), accountId: accountId})
        ]);
        const jLevel = Math.floor(Math.log2(Number(prf[j])));
        const iLevel = Math.floor(Math.log2(Number(i)));
        const jHashValue: string = (jValue == null)? this.getDefaultHashByLevel(jLevel): jValue.hash.toString();
        const iHashValue: string = (iValue == null)? this.getDefaultHashByLevel(iLevel): iValue.hash.toString();
        let r = (id % 2n == 0n) ?[ jHashValue, iHashValue] : [ iHashValue, jHashValue];
        const hash = this.hashFunc(r);
        const jobs = [];
        if (iValue == null) {
          jobs.push(manager.upsert(TokenMerkleTreeNode, {
            id: i.toString(), accountId: accountId, hash: BigInt(iHashValue)
          }, ['id', 'accountId']));
        }
        if (jValue == null && j < prf.length) {
          jobs.push(manager.upsert(TokenMerkleTreeNode, {
            id: prf[j].toString(), accountId: accountId, hash: BigInt(jHashValue)
          }, ['id', 'accountId']));
        }
        const updateRoot = i >> 1n;
        if ( updateRoot >= 1n) {
          jobs.push(this.tokenMerkleTreeRepository.upsert([{
            id: updateRoot.toString(), accountId: accountId, hash: BigInt(hash)
          }], ['id', 'accountId']));
        }
        await Promise.all(jobs);
        j++;
      }
    });
    console.timeEnd('updateLeaf for token tree');
  }
  async getLeaf(leaf_id: bigint, accountId: string): Promise<TokenLeafNode | null> {
    const result =  await this.tokenLeafRepository.findOneBy({leafId: leaf_id.toString()
      , accountId: accountId});
    if (result == null) {
      // check level
      const id = this.getLeafIdInTree(leaf_id);
      const level = Math.floor(Math.log2(Number(id)));
      const hash = this.getDefaultHashByLevel(level);
      // start transaction
      await this.connection.transaction(async (manager) => {
        // insert this null hash on this node
        await manager.insert(TokenMerkleTreeNode, {
          accountId: accountId,
          id: id.toString(),
          leafId: leaf_id.toString(),
          hash: BigInt(hash)
        });
        await manager.insert(TokenLeafNode, {
          leafId: leaf_id.toString(),
          accountId: accountId,
          L2TokenAddr: 1n,
        });
      });
      return  await this.tokenLeafRepository.findOneBy({leafId: leaf_id.toString(), accountId: accountId});
    }
    return result;
  }
  async getRoot(accountId: string): Promise<TokenTreeResponseDto> {
    const result =  await this.tokenMerkleTreeRepository.findOneBy({accountId: accountId, id: 1n.toString()});
    if (result == null) {
      const hash = this.getDefaultHashByLevel(1);
      await this.tokenMerkleTreeRepository.insert({
        accountId: accountId,
        id: 1n.toString(),
        hash: BigInt(hash)
      });
      return {
        accountId: accountId,
        id: 1,
        leafId: null,
        hash: hash
      }
    }
    const resultHash = result.hash ? result.hash.toString() : '';
    return {
      accountId: accountId,
      id: 1,
      leafId: null,
      hash: resultHash,
    };
  }
  
}