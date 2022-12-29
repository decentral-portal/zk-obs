import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuctionOrderLeafNode } from './auctionOrderLeafNode.entity';
import { AuctionBondTokenEntity } from './auctionBondToken.entity';
import { AuctionOrderMerkleTreeNode } from './auctionOrderMerkleTreeNode.entity';
import { ObsOrderEntity } from './obsOrder.entity';
import { ObsOrderLeafEntity } from './obsOrderLeaf.entity';
import { MatchObsOrderEntity } from './matchObsOrder.entity';
import { CandleStickEntity } from './candleStick.entity';
import { ObsOrderLeafMerkleTreeNode } from './obsOrderLeafMerkleTreeNode.entity';
import { MarketPairInfoEntity } from './marketPairInfo.entity';

@Global()
@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([
    // AuctionOrderMerkleTreeNode,
    // AuctionOrderLeafNode,
    ObsOrderEntity,
    ObsOrderLeafEntity,
    ObsOrderLeafMerkleTreeNode,
    MatchObsOrderEntity,
    MarketPairInfoEntity,
    CandleStickEntity, 
    AuctionBondTokenEntity,
  ])],
  providers: [ConfigService],
  exports: [TypeOrmModule]
})
export class AuctionOrderMoudle {}