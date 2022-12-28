import { Body, Controller, Logger, Post } from '@nestjs/common';
import { TsTxType } from '../account/dto/ts-type';
import { UpdateAuctionOrderDto } from './dto/updateAuctionOrder.dto';
import { TsAuctionOrderTreeService } from './tsAuctionOrderTree.service';

@Controller('orderMerkletree')
export class TsOrderMerkleTreeController {
  private logger: Logger = new Logger(TsOrderMerkleTreeController.name);
  private currentAuctionOrderId = 1;
  constructor(
    private readonly tsAuctionOrderTreeService: TsAuctionOrderTreeService,
  ) {
    this.tsAuctionOrderTreeService.getCurrentAuctionOrderId().then((id) => {
      this.currentAuctionOrderId = id+1;
      console.log(`currentAuctionOrderId: ${this.currentAuctionOrderId}`);
    });
  }
  @Post('updateAuctionOrderTree')
  async updateAuctionOrderTree(@Body() updateAuctionOrderto: UpdateAuctionOrderDto) {
    console.time('controller updateAuctionOrderTree');
    const orderId = this.currentAuctionOrderId;
    await this.tsAuctionOrderTreeService.updateLeaf(
      BigInt(orderId),
      updateAuctionOrderto.req,
      {
        reqType: updateAuctionOrderto.reqObject.reqType,
        txId: BigInt(updateAuctionOrderto.reqObject.txId),
        orderId: orderId,
      },
    );
    if (updateAuctionOrderto.reqObject.reqType.toString() === TsTxType.AUCTION_BORROW 
      || updateAuctionOrderto.reqObject.reqType.toString() === TsTxType.AUCTION_LEND) { 
      this.currentAuctionOrderId++;
    }
    console.timeEnd('controller updateAuctionOrderTree');
  }
}