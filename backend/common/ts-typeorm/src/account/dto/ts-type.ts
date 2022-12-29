export enum TsSystemAccountAddress {
  BURN_ADDR = '0',
  MINT_ADDR = '1',
  WITHDRAW_ADDR = '2',
  AUCTION_ADDR = '10',
}

export const TsDefaultValue = {
  NONCE_ZERO: '0',
  BIGINT_DEFAULT_VALUE: 0n,
  STRING_DEFAULT_VALUE: '0',
  ADDRESS_DEFAULT_VALUE: '0x00',
};

export enum TsTxType {
  UNKNOWN = '0',
  REGISTER = '1',
  DEPOSIT = '2',
  WITHDRAW = '3',
  SecondLimitOrder = '4',
  SecondLimitStart = '5',
  SecondLimitExchange = '6',
  SecondLimitEnd = '7',
  SecondMarketOrder = '8',
  SecondMarketExchange = '9',
  SecondMarketEnd = '10',
  CancelOrder = '11'
}
export const toTsTxType = (txType: string): TsTxType => {
  const type =  Object.values(TsTxType).find((value) => value === txType);
  if (!type) {
    return TsTxType.UNKNOWN;
  }
  return type;
}
export const TsDeciaml = {
  TS_TOKEN_AMOUNT_DEC: 18,
  TS_INTEREST_DEC: 6,
};

export enum TsTokenAddress {
  UNKNOWN = '0',
  WETH = '6',
  WBTC = '7',
  USDT = '8',
  USDC = '9',
  DAI = '10',

  // TODO: TSL Token mapping
  TslETH20221231 = '46',
  TslBTC20221231 = '47',
  TslUSDT20221231 = '48',
  TslUSDC20221231 = '49',
  TslDAI20221231 = '50',
}

export const toTsTokenAddressFromStr = (value: string): TsTokenAddress => {
  const token = Object.values(TsTokenAddress).find((token) => token.toString() == value);
  return token ? token : TsTokenAddress.UNKNOWN;
}