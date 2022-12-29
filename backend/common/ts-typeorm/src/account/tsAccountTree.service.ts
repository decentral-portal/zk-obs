import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AccountMerkleTreeNode } from './accountMerkleTreeNode.entity';
import { AccountLeafNode } from './accountLeafNode.entity';
import { Connection, Repository } from 'typeorm';
import { toTreeLeaf, tsHashFunc } from '../common/ts-helper';
import { TsMerkleTree } from '../common/tsMerkleTree';
import { UpdateAccountTreeDto } from './dto/updateAccountTree.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TsAccountTreeService extends TsMerkleTree<AccountLeafNode>{
  private logger: Logger = new Logger(TsAccountTreeService.name);
  constructor(
    @InjectRepository(AccountLeafNode)
    private accountLeafNodeRepository: Repository<AccountLeafNode>,
    @InjectRepository(AccountMerkleTreeNode)
    private accountMerkleTreeRepository: Repository<AccountMerkleTreeNode>,
    private connection: Connection,
    private readonly configService: ConfigService,
  ) {
    console.time('create Account Tree');
    super(configService.get<number>('ACCOUNTS_TREE_HEIGHT', 32), tsHashFunc);
    console.timeEnd('create Account Tree');
  }
  async getCurrentLeafIdCount(): Promise<number> {
    const leafIdCount = await this.accountLeafNodeRepository.count();
    return leafIdCount;
  }
  getLeafDefaultVavlue(): string {
    return toTreeLeaf([0n, 0n, 0n]);
  }
  async updateLeaf(leafId: bigint, value: UpdateAccountTreeDto) {
    console.time('updateLeaf for account tree');
    const prf = this.getProofIds(leafId);
    const id = this.getLeafIdInTree(leafId);
    // setup transaction
    await this.connection.transaction(async (manager) => {
      await manager.upsert(AccountMerkleTreeNode, {
        id: id.toString(),
        leafId: leafId,
        hash: BigInt(toTreeLeaf([
          BigInt(value.tsAddr), 
          BigInt(value.nonce), 
          BigInt(value.tokenRoot)])) 
        }, ['id']);
      await manager.upsert(AccountLeafNode, {
        tsAddr: BigInt(value.tsAddr),
        nonce: BigInt(value.nonce),
        tokenRoot: BigInt(value.tokenRoot),
        leafId: leafId,
      }, ['leafId']);
      // update tree
      for (let i = id, j = 0; i > 1n; i = i >> 1n) {
        const [iValue, jValue] = await Promise.all([
          this.accountMerkleTreeRepository.findOneBy({id: i.toString()}),
          this.accountMerkleTreeRepository.findOneBy({id: prf[j].toString()})
        ]);
        const jLevel = Math.floor(Math.log2(Number(prf[j])));
        const iLevel = Math.floor(Math.log2(Number(i)));
        const jHashValue: string = (jValue == null)? this.getDefaultHashByLevel(jLevel): jValue.hash.toString();
        const iHashValue: string = (iValue == null)? this.getDefaultHashByLevel(iLevel): iValue.hash.toString();
        let r = (id % 2n == 0n) ?[ jHashValue, iHashValue] : [ iHashValue, jHashValue];
        const hash = this.hashFunc(r);
        const jobs = [];
        if (iValue == null) {
          jobs.push(manager.upsert(AccountMerkleTreeNode, {
            id: i.toString(),
            hash: BigInt(iHashValue)
          }, ['id']));
        } 
        if (jValue == null && j < prf.length) {
          jobs.push(manager.upsert(AccountMerkleTreeNode, {
            id: prf[j].toString(),
            hash: BigInt(jHashValue)
          }, ['id']));
        }
        const updateRoot = i >> 1n;
        if ( updateRoot >= 1n) {
          jobs.push(manager.upsert(AccountMerkleTreeNode, {
            id: updateRoot.toString(),
            hash: BigInt(hash)
          }, ['id']));
        }
        await Promise.all(jobs);
        j++;
      }
    });
    // }
    console.timeEnd('updateLeaf for account tree');
  }
  async getLeaf(leaf_id: bigint, otherPayload: any): Promise<AccountLeafNode | null> {
    const result = await this.accountLeafNodeRepository.findOneBy({leafId: leaf_id});
    if (result == null) {
      // check level
      const id = this.getLeafIdInTree(leaf_id);
      const level = Math.floor(Math.log2(Number(id)));
      const hash = this.getDefaultHashByLevel(level);
      // setup transaction
      await this.connection.transaction(async (manager) => {
        // insert this null hash on this node
        await manager.insert(AccountMerkleTreeNode, {
          leafId: leaf_id,
          id: id.toString(),
          hash: BigInt(hash)
        });
        await manager.insert(AccountLeafNode, {
          leafId: leaf_id,
          tsAddr: 0n,
          nonce: 0n,
        });
      });
      return await this.accountLeafNodeRepository.findOneBy({leafId: leaf_id});   
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
        hash: BigInt(hash)
      });
      return {
        id: 1n.toString(),
        hash: hash
      }
    }
    return result;  
  }
}