import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuctionMainOrder } from './auctionMainOrder.entity';
import { AuctionMatchOrder } from './auctionMatchOrder.entity';
import { AuctionOrderLeafNode } from './auctionOrderLeafNode.entity';
import { AuctionBondTokenEntity } from './auctionBondToken.entity';
import { AuctionOrderMerkleTreeNode } from './auctionOrderMerkleTreeNode.entity';
import { AuctionRemainOrderView } from './auctionRemainOrderView.entity';
import { TsAuctionOrderTreeService } from './tsAuctionOrderTree.service';
import { AuctionL2RealBalanceViewEntity } from './auctionL2RealBalanceView.entity';

@Global()
@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([AuctionOrderMerkleTreeNode, AuctionOrderLeafNode, 
    AuctionMainOrder, AuctionMatchOrder, AuctionRemainOrderView, AuctionBondTokenEntity,
    AuctionL2RealBalanceViewEntity
  ])],
  providers: [ConfigService, TsAuctionOrderTreeService],
  exports: [TypeOrmModule]
})
export class AuctionOrderMoudle {}