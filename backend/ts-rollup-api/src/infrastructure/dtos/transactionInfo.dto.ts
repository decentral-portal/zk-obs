import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GetTransactionRequestDto {
  @ApiProperty()
  txId!: string;
}
export class GetTransactionResponseDto {
  @ApiProperty()
  txId!: string;
  @ApiPropertyOptional()
  blockNumber!: string;
  @ApiProperty()
  accountId!: string;
  @ApiProperty()
  tokenId!: string;
  @ApiProperty()
  accumulatedSellAmt!: string;
  @ApiProperty()
  accumulatedBuyAmt!: string;
  @ApiProperty()
  amount!: string;
  @ApiProperty()
  nonce!: string;
  @ApiProperty()
  arg0!: string;
  @ApiProperty()
  arg1!: string;
  @ApiProperty()
  arg2!: string;
  @ApiProperty()
  arg3!: string;
  @ApiProperty()
  arg4!: string;
  @ApiProperty()
  fee!: string;
  @ApiProperty()
  feeToken!: string;
  @ApiProperty()
  txStatus!: string;
}