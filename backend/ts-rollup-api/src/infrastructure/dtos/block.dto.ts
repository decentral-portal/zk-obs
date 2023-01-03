import { BLOCK_STATUS } from '@common/ts-typeorm/account/blockStatus.enum';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { TS_STATUS } from 'common/ts-typeorm/src/account/tsStatus.enum';
import { PaginationResponse } from './common.dto';

export class TransactionInfoDto {
  @ApiProperty()
  txId!: string;
  @ApiProperty()
  reqType!: string;
  @ApiPropertyOptional()
  blockNumber!: string|null;
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
  @ApiPropertyOptional()
  metadata!: object | null;
}

export class BlockInformationDto {
  @ApiProperty()
  blockNumber!: number;
  @ApiProperty()
  blockHash!: string | null;
  @ApiProperty()
  L1TransactionHash!: string;
  @ApiPropertyOptional()
  verifiedAt!: string;
  @ApiProperty()
  operatorAddress!: string;
  @ApiProperty()
  rawData!: string | null; 
  @ApiProperty()
  callData!: object | '{}';
  @ApiProperty()
  proof!: object | '{}';
  @ApiProperty({
    enum: BLOCK_STATUS,
    default: BLOCK_STATUS.PROCESSING,
  })
  blockStatus!: BLOCK_STATUS;
}


export class BlockInformationWithTxDto extends BlockInformationDto {
  @ApiProperty()
  totalTxs!: number;
  @ApiProperty({
    isArray: true,
    type: TransactionInfoDto,
  })
  latest10txs!: TransactionInfoDto[];
}
export class TransactionInfoPagination implements PaginationResponse<TransactionInfoDto> {
  @ApiProperty({
    isArray: true,
    type: TransactionInfoDto,
  })
  list!: TransactionInfoDto[];
  @ApiProperty()
  total!: number;
  @ApiProperty()
  perPage!: number;
  @ApiProperty()
  pageNumber!: number;
  @ApiProperty()
  totalPage!: number;
}
export class BlockInformationPagination implements PaginationResponse<BlockInformationDto> {
  @ApiProperty({
    isArray: true,
    type: BlockInformationDto,
  })
  list!: BlockInformationDto[];
  @ApiProperty()
  total!: number;
  @ApiProperty()
  perPage!: number;
  @ApiProperty()
  pageNumber!: number;
  @ApiProperty()
  totalPage!: number;
}

