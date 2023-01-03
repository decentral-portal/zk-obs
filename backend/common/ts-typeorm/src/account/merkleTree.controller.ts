import { Body, Controller, Get, Logger, Post, Query } from '@nestjs/common';
import { MarketPairInfoService } from '../auctionOrder/marketPairInfo.service';
import { UpdateAccountTreeDto } from './dto/updateAccountTree.dto';
import { UpdateTokenTreeDto } from './dto/updateTokenTree.dto';
import { TsAccountTreeService } from './tsAccountTree.service';
import { TsTokenTreeService } from './tsTokenTree.service';
import { MarketSellBuyPair } from '../auctionOrder/dto/MarketPairInfo.dto';
import { TsSide } from '../auctionOrder/tsSide.enum';
import { ObsOrderTreeService } from '../auctionOrder/obsOrderTree.service';
import { UpdateObsOrderTreeDto } from '../auctionOrder/dto/updateObsOrderTree.dto';
import { UpdateObsStateTreeDto } from './dto/updateObsStateTree.dto';
import { ObsMerkleTreeService } from './obsMerkleTreeService';

@Controller('merkleTree')
export class MerkleTreeController {
  private logger: Logger = new Logger(MerkleTreeController.name);
  private accountLeafId = 100n;
  // private tokeneLeafId: bigint = 0n;
  constructor(
    private readonly tsAccountTreeService: TsAccountTreeService,  
    private readonly tsTokenTreeService: TsTokenTreeService,
    private readonly obsOrderTreeService: ObsOrderTreeService,
    private readonly marketPairInfoService: MarketPairInfoService,
    private readonly obsStateTreeService: ObsMerkleTreeService,
  ) {
    this.tsAccountTreeService.getCurrentLeafIdCount().then((id) => {
      this.accountLeafId = BigInt(id)+ 100n;
      console.log(`accountLeafId: ${this.accountLeafId}`);
    });
  }

  @Post('updateAccountTree')
  async updateAccountTree(@Body() updateAccountTreeDto: UpdateAccountTreeDto) {
    console.time('controller updateAccountTree');
    await this.tsAccountTreeService.updateLeaf(
      BigInt(updateAccountTreeDto.leafId),
      updateAccountTreeDto
    );
    console.timeEnd('controller updateAccountTree');
  }
  @Post('updateTokenTree')
  async updateTokenTree(@Body() updateTokenTreeDto: UpdateTokenTreeDto) {
    console.time('controller updateTokenTree');
    // const tokeneLeafId = await this.tsTokenTreeService.getCurrentLeafIdCount(BigInt(updateTokenTreeDto.accountId));
    await this.tsTokenTreeService.updateLeaf(
      BigInt(updateTokenTreeDto.leafId),
      updateTokenTreeDto,
    );
    console.timeEnd('controller updateTokenTree');
  }
  @Post('updateObsOrderTree')
  async updateObsOrderTree(@Body() updateObsOrderTreeDto: UpdateObsOrderTreeDto) {
    console.time('controller updateObsOrderTree');
    await this.obsOrderTreeService.updateLeaf(
      BigInt(updateObsOrderTreeDto.orderLeafId),
      updateObsOrderTreeDto
    );
    console.timeEnd('controller updateObsOrderTree');
  }
  @Post('updateObsStateTree')
  async updateObsStateTree(@Body() updateObsStateTreeDto: UpdateObsStateTreeDto) {
    console.time('controller updateObsStateTree');
    await this.obsStateTreeService.updateStateTree(
      BigInt(updateObsStateTreeDto.accountId),
      BigInt(updateObsStateTreeDto.tokenId),
      BigInt(updateObsStateTreeDto.lockedAmt),
      BigInt(updateObsStateTreeDto.availableAmt),
    );
    console.timeEnd('controller updateObsStateTree');
  }
  @Get('marketPairInfo')
  async getMarketPairInfo(@Query() dto: MarketSellBuyPair) {
    console.log(dto);
    const pair = [{
      mainTokenId: dto.sellTokenId,
      baseTokenId: dto.buyTokenId,
    }, {
      mainTokenId: dto.buyTokenId,
      baseTokenId: dto.sellTokenId,
    }];
    const marketPairInfo = await this.marketPairInfoService.findOneMarketPairInfo({pairs: pair});
    const side = marketPairInfo.mainTokenId === dto.buyTokenId ?  TsSide.BUY: TsSide.SELL;
    return {
      ...marketPairInfo,
      side,
    };
  }
}