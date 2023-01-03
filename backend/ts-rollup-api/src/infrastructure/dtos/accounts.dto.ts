import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TsTxType } from '@ts-sdk/domain/lib/ts-types/ts-types';

export class TokenInfoType {
  @ApiProperty()
  tokenAddr!: string;
  @ApiProperty()
  amount!: string;
  @ApiProperty()
  lockAmt!: string;
}
export class AccountPreLoginDto {
  @ApiProperty()
  L1Address!: string;
}

export class AccountPreLoginResponse {
  @ApiProperty()
  L1Address!: string;
  @ApiProperty()
  expiredTime!: number;
  @ApiProperty()
  salt!: string;
}

export class AccountLoginDto {
  @ApiProperty({
    required: true,
  })
  L1Address!: string;
  @ApiProperty()
  expiredTime!: number;
  @ApiProperty()
  salt!: string;
  @ApiProperty()
  signature!: string;
}
export class AccountLoginResponse {
  @ApiProperty()
  L1Address!: string;
  @ApiProperty()
  accountId!: string;
  @ApiProperty()
  expiredTime!: number;
  @ApiProperty()
  token!: string;
}


export class AccountBalanceQueryDto {
  @ApiProperty({
    required: false,
    isArray: true,
    type: [String],
  })
  L2TokenAddr?: string[];
  @ApiProperty({ required: false})
  L1Address?: string;
  @ApiProperty({ required: false})
  accountId?: string;
}



export class AccountQueryDto {
  @ApiPropertyOptional({
    type: 'string'
  })
  L1Address!: string | null;
  @ApiPropertyOptional({
    type: 'string'
  })
  accountId!: string | null;
}

// TODO: Account Infomation
export class AccountInformation {
  @ApiProperty({ required: false})
  name!: string;
  @ApiProperty({ required: false})
  mail!: string;
  @ApiPropertyOptional({ required: false})
  socialId!: string | null;
  @ApiProperty({ required: false})
  createdTime!: number;
  @ApiProperty({ required: false})
  updatedTime!: number;
}
export class AccountInfoDto {
  @ApiProperty()
  L1Address!: string;
  @ApiProperty()
  accountId!: string;
  @ApiProperty()
  nonce!: string;
  @ApiPropertyOptional({ required: false})
  name!: string;
  @ApiPropertyOptional({ required: false})
  mail!: string;
  @ApiPropertyOptional({ required: false})
  socialId!: string | null;
  @ApiProperty({ required: false})
  createdTime!: number;
  @ApiProperty({ required: false})
  updatedTime!: number;
}
export class AccountInfoResponse extends AccountInformation {
  @ApiProperty()
    L1Address!: string;
  @ApiProperty()
    accountId!: string;
  @ApiProperty()
    nonce!: string;
  @ApiProperty({
    isArray: true,
    type: TokenInfoType,
  })
  tokenLeafs!: TokenInfoType[];
}

export class AccountLoginHistoryQueryDto {
    @ApiProperty({ required: false})
      L1Address?: string;
    @ApiProperty({ required: false})
      accountId?: string;
    @ApiProperty()
      start!: string;
}

export class AccountLoginHistoryItem {
    @ApiProperty({ required: false})
      L1Address?: string;
    @ApiProperty({ required: false})
      accountId?: string;
    @ApiProperty()
      ip!: string;
    @ApiProperty()
      loginedTime!: number;
    @ApiProperty()
      browserAgent!: string;
}

export class AccountLoginHistoryResponse {
    @ApiProperty({
      isArray: true,
      type: AccountLoginHistoryItem,
    })
      list!: AccountLoginHistoryItem[];
    @ApiProperty()
      total!: number;
    @ApiProperty()
      start!: number;
    @ApiProperty()
      end!: number;
}

export class L2TransactionHistoryItem {
    @ApiProperty()
      txType!: string;
    @ApiProperty()
      L2FromAddress!: string;
    @ApiProperty()
      L2toAddress!: string;
    @ApiProperty()
      L2TokenAddress!: string;
    @ApiProperty()
      amount!: string;
    @ApiProperty()
      nonce!: string;
    @ApiProperty()
      blockNumber!: string;
    @ApiProperty()
      createdTime!: number;
    @ApiProperty()
      updatedTime!: number;
}

export class L2TransactionHistoryResponse {
    @ApiProperty({
      isArray: true,
      type: L2TransactionHistoryItem,
    })
      list!: L2TransactionHistoryItem[];
    @ApiProperty()
      total!: number;
    @ApiProperty()
      start!: number;
    @ApiProperty()
      end!: number;
}


export class AccountUpdateDto {
    // L1Address?: string;
    @ApiProperty()
      accountId!: string;

    // TODO: TsAccountInfo Model
    @ApiProperty({
      name: 'newInfo',
      type: AccountInformation,
    })
      newInfo!: Partial<AccountInformation>;
}


export class AccountTxHistoryDto {
    @ApiProperty({ required: false})
      L1Address?: string;
    @ApiProperty({ required: false})
      accountId?: string;
    @ApiProperty({ required: false})
      startTime?: number;
    @ApiProperty({ required: false})
      endTime?: number;
    @ApiProperty({ required: false, enum: TsTxType})
      txType?: TsTxType;
    @ApiProperty({ required: false})
      start?: number;
}