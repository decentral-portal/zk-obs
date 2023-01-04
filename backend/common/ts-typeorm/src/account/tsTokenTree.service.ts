import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';

import { Connection, IsNull, Not, Repository, In, EntityManager } from 'typeorm';
import { toTreeLeaf, tsHashFunc } from '../common/ts-helper';
import { TsMerkleTree } from '../common/tsMerkleTree';
import { TokenTreeResponseDto } from './dto/tokenTreeResponse.dto';
import { UpdateTokenTreeDto } from './dto/updateTokenTree.dto';
import { getDefaultTokenLeaf } from './helper/mkAccount.helper';
import { TokenLeafNode } from './tokenLeafNode.entity';
import { TokenMerkleTreeNode } from './tokenMerkleTreeNode.entity';
import { TsAccountTreeService } from './tsAccountTree.service';
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
    this.setLevelDefaultHash();
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
  getDefaultRoot(): string {
    return this.getDefaultHashByLevel(1);
  }

  getLeafDefaultVavlue(): string {
    return getDefaultTokenLeaf();
  }
  async updateLeaf(leafId: string, value: UpdateTokenTreeDto) {
    console.time('updateLeaf for token tree');
    await this.connection.transaction(async (manager) => {
      await this._updateLeaf(manager, leafId, value);
    });
    console.timeEnd('updateLeaf for token tree');
  }
  async _updateLeaf(manager: EntityManager, tokenLeafId: string, value: UpdateTokenTreeDto) {
    const prf = this.getProofIds(tokenLeafId);
    const id = this.getLeafIdInTree(tokenLeafId);
    const leafHashDecString = BigInt(toTreeLeaf([BigInt(value.leafId), BigInt(value.lockedAmt), BigInt(value.availableAmt)])).toString();
    const accountId = value.accountId;
    // update leaf
    await manager.upsert(TokenMerkleTreeNode, {
      accountId: accountId,
      id: id.toString(),
      leafId: tokenLeafId.toString(),
      hash: leafHashDecString
    }, ['id', 'accountId']);
    await manager.upsert(TokenLeafNode, {
      leafId: tokenLeafId.toString(),
      accountId: accountId,
      lockedAmt: value.lockedAmt,
      availableAmt: value.availableAmt
    }, ['leafId', 'accountId']);
    // update proof
    for (let i = id, j = 0; i > 1n; i = i >> 1n) {
      const [iValue, jValue] = await Promise.all([
        this.tokenMerkleTreeRepository.findOneBy({ id: i.toString(), accountId: accountId }),
        this.tokenMerkleTreeRepository.findOneBy({ id: prf[j].toString(), accountId: accountId })
      ]);
      const jLevel = Math.floor(Math.log2(Number(prf[j])));
      const iLevel = Math.floor(Math.log2(Number(i)));
      const jHashValue: string = (jValue == null) ? this.getDefaultHashByLevel(jLevel) : jValue.hash.toString();
      const iHashValue: string = (iValue == null) ? this.getDefaultHashByLevel(iLevel) : iValue.hash.toString();
      const r = (id % 2n == 0n) ? [jHashValue, iHashValue] : [iHashValue, jHashValue];
      const hashDecString = BigInt(this.hashFunc(r)).toString();
      console.log({
        id, value,
        tokenLeafId,
        i,
        jLevel,
        iLevel,
        jHashValue, 
        iHashValue,
        height: this.treeHeigt,
        hashDecString
      });
      const jobs = [];
      if (iValue == null) {
        jobs.push(manager.upsert(TokenMerkleTreeNode, {
          id: i.toString(), accountId: accountId, hash: (iHashValue)
        }, ['id', 'accountId']));
      }
      if (jValue == null && j < prf.length) {
        jobs.push(manager.upsert(TokenMerkleTreeNode, {
          id: prf[j].toString(), accountId: accountId, hash: (jHashValue)
        }, ['id', 'accountId']));
      }
      const updateRoot = i >> 1n;
      if (updateRoot >= 1n) {
        jobs.push(this.tokenMerkleTreeRepository.upsert([{
          id: updateRoot.toString(), accountId: accountId, hash: hashDecString
        }], ['id', 'accountId']));
      }
      await Promise.all(jobs);
      j++;
    }
    const root = await this.getRoot(accountId);
    return root;
  }

  async getLeaf(leaf_id: string, accountId: string): Promise<TokenLeafNode> {
    const result =  await this.tokenLeafRepository.findOneBy({leafId: leaf_id.toString()
      , accountId: accountId});
    if (result == null) {
      // check level
      const id = this.getLeafIdInTree(leaf_id);
      const level = Math.floor(Math.log2(Number(id)));
      const hashDecString = BigInt(this.getDefaultHashByLevel(level)).toString();
      // start transaction
      await this.connection.transaction(async (manager) => {
        // insert this null hash on this node
        await manager.upsert(TokenMerkleTreeNode, {
          accountId: accountId,
          id: id.toString(),
          leafId: leaf_id.toString(),
          hash: hashDecString,
        }, [
          'id', 'accountId'
        ]);
        await manager.upsert(TokenLeafNode, {
          leafId: leaf_id.toString(),
          accountId: accountId,
          lockedAmt: '0',
          availableAmt: '0',
        }, ['leafId', 'accountId']);
      });
      return await this.tokenLeafRepository.findOneByOrFail({leafId: leaf_id.toString(), accountId: accountId});
    }
    return result;
  }
  async getRoot(accountId: string): Promise<TokenTreeResponseDto> {
    const result =  await this.tokenMerkleTreeRepository.findOneBy({accountId: accountId, id: 1n.toString()});
    if (result == null) {
      const hashDecString = BigInt(this.getDefaultHashByLevel(1)).toString();
      await this.tokenMerkleTreeRepository.insert({
        accountId: accountId,
        id: 1n.toString(),
        hash: hashDecString
      });
      return {
        accountId: accountId,
        id: 1,
        leafId: null,
        hash: hashDecString
      };
    }
    const resultHash = result.hash ? BigInt(result.hash).toString() : '';
    return {
      accountId: accountId,
      id: 1,
      leafId: null,
      hash: resultHash,
    };
  }
  async getMerklerProof(leafId: string): Promise<bigint[]> {
    throw new Error('canot use getMerklerProof in TokenTree');
  }
  async getMerklerProofByAccountId(leafId: string, accountId: string): Promise<bigint[]> {
    const ids = this.getProofIds(leafId);
    const r = await this.tokenMerkleTreeRepository.find({
      where: {
        accountId: accountId,
        id: In(ids.map(v => v.toString()))
      },
      order: {
        id: 'ASC'
      }
    });
    return r.map(item => BigInt(item.hash));
  }
  
}