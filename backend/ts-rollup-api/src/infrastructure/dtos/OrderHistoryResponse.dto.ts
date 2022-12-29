import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TsMarketPair } from '@ts-rollup-api/domain/value-objects/tsMarketPair.enum';
import { TsSide } from '@ts-rollup-api/domain/value-objects/tsSide.enum';
import { TsTxType } from '@ts-rollup-api/domain/value-objects/tsTxType.enum';
import { boolean } from 'io-ts';

export class OrderInformationDto {
  @ApiProperty()
  txId!: string;
  @ApiProperty({
    enum: TsTxType,
  })
  reqType!: TsTxType;
  @ApiProperty({
    enum: TsSide
  })
  side!: TsSide;
  @ApiProperty()
  accountId!: string;
  @ApiProperty({
    enum: TsMarketPair,
    default: TsMarketPair.ETH_USDC,
  })
  marketPair!: TsMarketPair;
  @ApiProperty()
  price!: string;
  @ApiProperty()
  orderStatus!: string;
  @ApiProperty()
  mainQuantity!: string;
  @ApiProperty()
  baseQuantity!: string;
  @ApiProperty()
  remainMQ!: string;
  @ApiProperty()
  remainBQ!: string;
  @ApiProperty({
    type: boolean,
    default: false,
  })
  isMaker!: boolean;
}
export class OrderHistoryResponseDto {
  @ApiProperty()
  total!: number;
  @ApiProperty()
  perPage!: number;
  @ApiProperty()
  pageNumber!: number;
  @ApiProperty()
  totalPage!: number;
  @ApiProperty({
    isArray: true,
    type: [OrderInformationDto],
  })
  list!: OrderInformationDto[];
}