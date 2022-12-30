import { Body, Controller, Get, Logger, Post, Query } from '@nestjs/common';
import { MarketPairInfoService } from '../auctionOrder/marketPairInfo.service';
import { UpdateAccountTreeDto } from './dto/updateAccountTree.dto';
import { UpdateTokenTreeDto } from './dto/updateTokenTree.dto';
import { TsAccountTreeService } from './tsAccountTree.service';
import { TsTokenTreeService } from './tsTokenTree.service';

@Controller('merkleTree')
export class MerkleTreeController {
  private logger: Logger = new Logger(MerkleTreeController.name);
  private accountLeafId: bigint = 100n;
  // private tokeneLeafId: bigint = 0n;
  constructor(
    private readonly tsAccountTreeService: TsAccountTreeService,  
    private readonly tsTokenTreeService: TsTokenTreeService,
    private readonly marketPairInfoService: MarketPairInfoService,
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
      this.accountLeafId,
      updateAccountTreeDto
      );
    this.accountLeafId++;
    console.timeEnd('controller updateAccountTree');
  }
  @Post('updateTokenTree')
  async updateTokenTree(@Body() updateTokenTreeDto: UpdateTokenTreeDto) {
    console.time('controller updateTokenTree');
    const tokeneLeafId = await this.tsTokenTreeService.getCurrentLeafIdCount(BigInt(updateTokenTreeDto.accountId));
    await this.tsTokenTreeService.updateLeaf(
      BigInt(tokeneLeafId),
      updateTokenTreeDto,
      );
    console.timeEnd('controller updateTokenTree');
  }
  @Get('marketPairInfo')
  async getMarketPairInfo(@Query() obj: any ) {
    const pair = [{
      mainTokenId: obj.sellTokenId,
      baseTokenId: obj.buyTokenId,
    }, {
      mainTokenId: obj.buyTokenId,
      baseTokenId: obj.sellTokenId,
    }]
    const marketPairInfo = await this.marketPairInfoService.findOneMarketPairInfo({pairs: pair});
    return marketPairInfo;
  }
}