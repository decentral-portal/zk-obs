import { Injectable, Logger } from '@nestjs/common';
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
  ) {
    console.time('init token tree');
    super(16, tsHashFunc);
    console.timeEnd('init token tree');
  }
  async getCurrentLeafIdCount(L2Address: bigint): Promise<number> {
    const leafIdCount = await this.tokenMerkleTreeRepository.count(
      {
        where: {
          L2Address: L2Address.toString(),
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
      const l2Address = value.L2Address;
      // update leaf
      await manager.upsert(TokenMerkleTreeNode, {
        L2Address: l2Address,
        id: id.toString(),
        leafId: leafId.toString(),
        hash: BigInt(leafHash)
      }, ['id', 'L2Address']);
      await manager.upsert(TokenLeafNode, {
        leafId:  leafId.toString(),
        L2Address: l2Address,
        L2TokenAddr: BigInt(value.L2TokenAddr),
        lockedAmt: BigInt(value.lockedAmt),
        availableAmt: BigInt(value.availableAmt)       
      }, ['leafId', 'L2Address']);
      // update proof
      for (let i = id, j = 0; i > 1n; i = i >> 1n) {
        const [iValue, jValue ]= await Promise.all([
          this.tokenMerkleTreeRepository.findOneBy({id: i.toString(), L2Address: l2Address}),
          this.tokenMerkleTreeRepository.findOneBy({id: prf[j].toString(), L2Address: l2Address})
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
            id: i.toString(), L2Address: l2Address, hash: BigInt(iHashValue)
          }, ['id', 'L2Address']));
        }
        if (jValue == null && j < prf.length) {
          jobs.push(manager.upsert(TokenMerkleTreeNode, {
            id: prf[j].toString(), L2Address: l2Address, hash: BigInt(jHashValue)
          }, ['id', 'L2Address']));
        }
        const updateRoot = i >> 1n;
        if ( updateRoot >= 1n) {
          jobs.push(this.tokenMerkleTreeRepository.upsert([{
            id: updateRoot.toString(), L2Address: l2Address, hash: BigInt(hash)
          }], ['id', 'L2Address']));
        }
        await Promise.all(jobs);
        j++;
      }
    });
    console.timeEnd('updateLeaf for token tree');
  }
  async getLeaf(leaf_id: bigint, l2Address: string): Promise<TokenLeafNode | null> {
    const result =  await this.tokenLeafRepository.findOneBy({leafId: leaf_id.toString()
      , L2Address: l2Address});
    if (result == null) {
      // check level
      const id = this.getLeafIdInTree(leaf_id);
      const level = Math.floor(Math.log2(Number(id)));
      const hash = this.getDefaultHashByLevel(level);
      // start transaction
      await this.connection.transaction(async (manager) => {
        // insert this null hash on this node
        await manager.insert(TokenMerkleTreeNode, {
          L2Address: l2Address,
          id: id.toString(),
          leafId: leaf_id.toString(),
          hash: BigInt(hash)
        });
        await manager.insert(TokenLeafNode, {
          leafId: leaf_id.toString(),
          L2Address: l2Address,
          L2TokenAddr: 1n,
        });
      });
      return  await this.tokenLeafRepository.findOneBy({leafId: leaf_id.toString(), L2Address: l2Address});
    }
    return result;
  }
  async getRoot(l2Address: string): Promise<TokenTreeResponseDto> {
    const result =  await this.tokenMerkleTreeRepository.findOneBy({L2Address: l2Address, id: 1n.toString()});
    if (result == null) {
      const hash = this.getDefaultHashByLevel(1);
      await this.tokenMerkleTreeRepository.insert({
        L2Address: l2Address,
        id: 1n.toString(),
        hash: BigInt(hash)
      });
      return {
        L2Address: l2Address,
        id: 1,
        leafId: null,
        hash: hash
      }
    }
    const resultHash = result.hash ? result.hash.toString() : '';
    return {
      L2Address: l2Address,
      id: 1,
      leafId: null,
      hash: resultHash,
    };
  }
  
}