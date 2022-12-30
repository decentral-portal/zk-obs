import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TsTxType } from '@ts-sdk/domain/lib/ts-types/ts-types';
import { TS_STATUS } from 'common/ts-typeorm/src/account/tsStatus.enum';
import { PaginationResponse } from './common.dto';

export class TransactionInfoDto {
  @ApiProperty()
  txId!: number;
  @ApiProperty()
  blockNumber!: number;
  @ApiProperty({
    enum: TsTxType,
  })
  reqType!: TsTxType;
  @ApiProperty()
  L2AddrFrom!: string;
  @ApiProperty()
  L2AddrTo!: string;
  @ApiProperty()
  L2TokenAddr!: string;
  @ApiProperty()
  amount!: string;
  @ApiProperty()
  nonce!: number;
  @ApiProperty()
  arg0!: string | null;
  @ApiProperty()
  arg1!: string | null;
  @ApiProperty()
  arg2!: string | null;
  @ApiProperty()
  arg3!: string | null;
  @ApiProperty()
  arg4!: string | null;
  @ApiProperty()
  fee!: string;
  @ApiProperty()
  feeToken!: string;
  @ApiProperty()
  metadata!: object | null;
  @ApiProperty({
    enum: TS_STATUS,
  })
  txStatus!: TS_STATUS;
}

export class BlockInformationDto {
  @ApiProperty()
  blockNumber!: number;
  @ApiProperty()
  circuitName!: string;

  @ApiProperty()
  startTxId!: number;
  @ApiProperty()
  endTxId!: number;

  // @ApiProperty()
  // publicInput!: object;
  @ApiProperty()
  publicCalldata!: string;
  @ApiProperty()
  proof!: object;
  
  @ApiProperty()
  oldStateRoot!: string;
  @ApiPropertyOptional()
  newStateRoot!: string;
  @ApiPropertyOptional()
  L2CommittedAt!: number;
  @ApiPropertyOptional()
  L1VerifiedTxHash!: string;
  @ApiPropertyOptional()
  L1VerifiedAt!: number;

  @ApiProperty({
    enum: TS_STATUS,
  })
  status!: TS_STATUS;
}


export class BlockInformationWithTxDto extends BlockInformationDto {
  @ApiProperty({
    isArray: true,
    type: TransactionInfoDto,
  })
  txs!: TransactionInfoDto[];
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