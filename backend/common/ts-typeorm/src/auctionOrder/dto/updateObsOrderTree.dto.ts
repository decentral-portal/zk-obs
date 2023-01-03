import { ApiProperty } from '@nestjs/swagger';

export class UpdateObsOrderTreeDto {
  @ApiProperty({
    type: String
  })
  orderLeafId!: string;
  @ApiProperty({
    type: String
  })
  txId!: string;
  @ApiProperty({
    type: String
  })
  reqType!: string;
  @ApiProperty({
    type: String
  })
  sender!: string;
  @ApiProperty({
    type: String
  })
  sellTokenId!: string;
  @ApiProperty({
    type: String
  })
  nonce!: string;
  @ApiProperty({
    type: String
  })
  sellAmt!: string;
  @ApiProperty({
    type: String
  })
  buyTokenId!: string;
  @ApiProperty({
    type: String
  })
  buyAmt!: string;
  @ApiProperty({
    type: String
  })
  accumulatedSellAmt!: string;
  @ApiProperty({
    type: String
  })
  accumulatedBuyAmt!: string;
  @ApiProperty({
    type: String
  })
  orderId!: string;
}