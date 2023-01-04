import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In } from 'typeorm';
import { AccountMerkleTreeNode } from './accountMerkleTreeNode.entity';
import { AccountLeafNode } from './accountLeafNode.entity';
import { Connection, Repository } from 'typeorm';
import { toTreeLeaf, tsHashFunc } from '../common/ts-helper';
import { TsMerkleTree } from '../common/tsMerkleTree';
import { UpdateAccountTreeDto } from './dto/updateAccountTree.dto';
import { ConfigService } from '@nestjs/config';
import { getDefaultAccountLeaf} from './helper/mkAccount.helper';
import { TsTokenTreeService } from './tsTokenTree.service';
import { UpdateTokenTreeDto } from './dto/updateTokenTree.dto';

@Injectable()
export class TsAccountTreeService extends TsMerkleTree<AccountLeafNode>{
  private logger: Logger = new Logger(TsAccountTreeService.name);
  private TOKENS_TREE_HEIGHT: number;
  constructor(
    @InjectRepository(AccountLeafNode)
    private accountLeafNodeRepository: Repository<AccountLeafNode>,
    @InjectRepository(AccountMerkleTreeNode)
    private accountMerkleTreeRepository: Repository<AccountMerkleTreeNode>,
    private connection: Connection,
    private readonly tokenTreeService: TsTokenTreeService,
    private readonly configService: ConfigService,
  ) {
    console.time('create Account Tree');
    super(configService.getOrThrow<number>('ACCOUNTS_TREE_HEIGHT'), tsHashFunc);
    console.timeEnd('create Account Tree');
    this.TOKENS_TREE_HEIGHT = configService.getOrThrow<number>('TOKENS_TREE_HEIGHT');
    this.setLevelDefaultHash();
  }
  async getCurrentLeafIdCount(): Promise<number> {
    const leafIdCount = await this.accountLeafNodeRepository.count();
    return leafIdCount;
  }
  getDefaultTokenTreeRoot() {
    return this.tokenTreeService.getDefaultRoot();
  }
  getDefaultRoot(): string {
    return this.getDefaultHashByLevel(1);
  }
  getLeafDefaultVavlue(): string {
    return getDefaultAccountLeaf(this.getDefaultTokenTreeRoot());
  }
  // async _updateLeaf()
  async updateLeaf(leafId: string, value: UpdateAccountTreeDto) {
    console.time('updateLeaf for account tree');
    // setup transaction
    await this.connection.transaction(async (manager) => {
      await this._updateLeaf(manager, leafId, value);
    });
    // }
    console.timeEnd('updateLeaf for account tree');
  }
  async _updateLeaf(manager: EntityManager, leafId: string, value: UpdateAccountTreeDto) {
    const prf = this.getProofIds(leafId);
    const id = this.getLeafIdInTree(leafId);
    const originValue = await this.getLeaf(leafId);
    const newValue = {
      tsAddr: value.tsAddr || originValue.tsAddr,
      nonce: value.nonce || originValue.nonce,
      tokenRoot: value.tokenRoot || originValue.tokenRoot,
    };
    await manager.upsert(AccountMerkleTreeNode, {
      id: id.toString(),
      leafId: leafId,
      hash: (toTreeLeaf([
        BigInt(newValue.tsAddr),
        BigInt(newValue.nonce),
        BigInt(newValue.tokenRoot)
      ]))
    }, ['id']);
    await manager.upsert(AccountLeafNode, {
      tsAddr: (newValue.tsAddr),
      nonce: (newValue.nonce),
      tokenRoot: (newValue.tokenRoot),
      leafId: leafId.toString(),
    }, ['leafId']);
    // update tree
    for (let i = id, j = 0; i > 1n; i = i >> 1n) {
      const [iValue, jValue] = await Promise.all([
        this.accountMerkleTreeRepository.findOneBy({ id: i.toString() }),
        this.accountMerkleTreeRepository.findOneBy({ id: prf[j].toString() })
      ]);
      const jLevel = Math.floor(Math.log2(Number(prf[j])));
      const iLevel = Math.floor(Math.log2(Number(i)));
      const jHashValue: string = (jValue == null) ? this.getDefaultHashByLevel(jLevel) : jValue.hash.toString();
      const iHashValue: string = (iValue == null) ? this.getDefaultHashByLevel(iLevel) : iValue.hash.toString();
      const r = (id % 2n == 0n) ? [jHashValue, iHashValue] : [iHashValue, jHashValue];
      const hash = this.hashFunc(r);
      const jobs = [];
      if (iValue == null) {
        jobs.push(manager.upsert(AccountMerkleTreeNode, {
          id: i.toString(),
          hash: (iHashValue)
        }, ['id']));
      }
      if (jValue == null && j < prf.length) {
        jobs.push(manager.upsert(AccountMerkleTreeNode, {
          id: prf[j].toString(),
          hash: (jHashValue)
        }, ['id']));
      }
      const updateRoot = i >> 1n;
      if (updateRoot >= 1n) {
        jobs.push(manager.upsert(AccountMerkleTreeNode, {
          id: updateRoot.toString(),
          hash: (hash)
        }, ['id']));
      }
      await Promise.all(jobs);
      j++;
    }
  }

  async updateTokenLeaf(leafId: string, value: UpdateTokenTreeDto) {
    return await this.connection.transaction(async (manager) => {
      const tokenRoot = await this.tokenTreeService._updateLeaf(manager, leafId, value);
      await this._updateLeaf(manager, (value.accountId), {
        leafId: value.accountId,
        tokenRoot: tokenRoot.hash,
      });
    });
  }


  async getLeaf(leaf_id: string): Promise<AccountLeafNode> {
    const result = await this.accountLeafNodeRepository.findOneBy({leafId: leaf_id.toString()});
    if (result == null) {
      const emptyAccount = this.accountLeafNodeRepository.create();
      emptyAccount.tsAddr = '0';
      emptyAccount.nonce = '0';
      emptyAccount.tokenRoot = BigInt(this.getDefaultTokenTreeRoot()).toString();
      emptyAccount.leafId = leaf_id.toString();
      return emptyAccount;
    }
    return result;  
  }
  async getRoot() {
    const result = await this.accountMerkleTreeRepository.findOneBy({
      id: 1n.toString(),
    });
    if (result == null) {
      const hash = await this.getDefaultHashByLevel(1);
      await this.accountMerkleTreeRepository.insert({
        id: 1n.toString(),
        hash: (hash)
      });
      return {
        id: 1n.toString(),
        hash: hash
      };
    }
    return result;  
  }

  async addLeaf(value: UpdateAccountTreeDto) {
    const leafId = (value.leafId);
    if(!value.tsAddr) {
      throw new Error('tsAddr should not be null');
    }
    const id = this.getLeafIdInTree(leafId);
    const level = Math.floor(Math.log2(Number(id)));
    // TODO: check register evemt has tokenInfo
    const hash = this.getDefaultHashByLevel(level);
    // setup transaction
    await this.connection.transaction(async (manager) => {
      // insert this null hash on this node
      await manager.insert(AccountMerkleTreeNode, {
        leafId: leafId,
        id: id.toString(),
        hash: (hash)
      });
      await manager.insert(AccountLeafNode, {
        leafId: leafId.toString(),
        tsAddr: (value.tsAddr as string),
        nonce: '0',
        tokenRoot: (this.getDefaultTokenTreeRoot())
      });
    });
  }

  async getMerklerProof(leafId: string): Promise<bigint[]> {
    console.log('getMerklerProof', leafId);
    const ids = this.getProofIds(leafId);
    const r = await this.accountMerkleTreeRepository.find({
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