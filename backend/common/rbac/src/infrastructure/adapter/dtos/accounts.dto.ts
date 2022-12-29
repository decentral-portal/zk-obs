import { ApiProperty } from '@nestjs/swagger';

export enum TsTokenAddress {
  Unknown = '0',
  WETH = '1',
  WBTC = '2',
  USDT = '3',
  USDC = '4',
  DAI = '5',
}
export const checkTsTokenAddress = (token: string) => {
  const value = Object.values(TsTokenAddress).find((_, index) => index.toString() == token );
  if (value!= undefined) {
    return value;
  }
  return TsTokenAddress.Unknown;
}
export class TsTokenInfo {
  tokenAddr!: TsTokenAddress;
  amount!: string;
  lockAmt!: string;
}
export class AccountBalanceQueryDto {
  @ApiProperty({
    isArray: true,
    // type: TsTokenAddress,
  })
  L2TokenAddr!: TsTokenAddress[];
  @ApiProperty({ required: false})
  L1Address?: string;
  @ApiProperty({ required: false})
  L2Address?: string;
}

export class AccountBalanceResponse {
  @ApiProperty({
    isArray: true
  })
  list!: TsTokenInfo[];
  @ApiProperty({
    type: String
  })
  nonce!: string;  
}
