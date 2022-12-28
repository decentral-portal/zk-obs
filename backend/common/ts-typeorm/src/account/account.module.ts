import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountInformation } from './accountInformation.entity';
import { AccountLeafNode } from './accountLeafNode.entity';
import { AccountMerkleTreeNode } from './accountMerkleTreeNode.entity';
import { BlockInfo } from './blockInfo.entity';
import { MerkleTreeController } from './merkleTree.controller';
import { TokenLeafNode } from './tokenLeafNode.entity';
import { TokenMerkleTreeNode } from './tokenMerkleTreeNode.entity';
import { TransactionInfo } from './transactionInfo.entity';
import { TsAccountTreeService } from './tsAccountTree.service';
import { TsTokenTreeService } from './tsTokenTree.service';
@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([
      AccountInformation,
      AccountLeafNode, 
      AccountMerkleTreeNode, 
      TokenMerkleTreeNode, 
      TokenLeafNode,
      TransactionInfo,
      BlockInfo
    ])
  ],
  providers: [TsAccountTreeService, TsTokenTreeService],
  exports: [TypeOrmModule]
})
export class AccountModule{}