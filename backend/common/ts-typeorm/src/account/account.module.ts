import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ObsOrderTreeService } from '../auctionOrder/obsOrderTree.service';
import { AccountInformation } from './accountInformation.entity';
import { AccountLeafNode } from './accountLeafNode.entity';
import { AccountMerkleTreeNode } from './accountMerkleTreeNode.entity';
import { BlockInformation } from './blockInformation.entity';
import { MerkleTreeController } from './merkleTree.controller';
import { ObsMerkleTreeService } from './obsMerkleTreeService';
// import { MerkleTreeController } from './merkleTree.controller';
import { TokenLeafNode } from './tokenLeafNode.entity';
import { TokenMerkleTreeNode } from './tokenMerkleTreeNode.entity';
import { TransactionInfo } from './transactionInfo.entity';
import { TsAccountTreeService } from './tsAccountTree.service';
import { TsTokenTreeService } from './tsTokenTree.service';
@Global()
@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forFeature([
      AccountInformation,
      AccountLeafNode, 
      AccountMerkleTreeNode, 
      TokenMerkleTreeNode, 
      TokenLeafNode,
      TransactionInfo,
      BlockInformation
    ])
  ],
  providers: [TsAccountTreeService, TsTokenTreeService, ObsMerkleTreeService],
  controllers: [],
  exports: [TsAccountTreeService, TsTokenTreeService, ObsMerkleTreeService]
})
export class AccountModule{}