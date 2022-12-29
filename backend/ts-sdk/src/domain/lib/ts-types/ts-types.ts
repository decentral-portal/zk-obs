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
    TRANSFER = '3',
    WITHDRAW = '4',
    AUCTION_LEND = '5',
    AUCTION_BORROW = '6',
    AUCTION_CANCEL = '7',
}

export const TsDeciaml = {
  TS_TOKEN_AMOUNT_DEC: 18,
  TS_INTEREST_DEC: 6,
};

export const TsTxTypeLengthMap: {
    [key in TsTxType]: number;
} = {
  // TODO: define the data length for each tx type
  //! Need to check again
  [TsTxType.UNKNOWN]: 0,
  [TsTxType.REGISTER]: 0,
  [TsTxType.DEPOSIT]: 5,
  [TsTxType.TRANSFER]: 5,
  [TsTxType.WITHDRAW]: 5,
  [TsTxType.AUCTION_LEND]: 7,
  [TsTxType.AUCTION_BORROW]: 9,
  [TsTxType.AUCTION_CANCEL]: 6,
};

export const TsTxCalldataNum = {
  [TsTxType.REGISTER]: 5,
  [TsTxType.DEPOSIT]: 6,
  [TsTxType.TRANSFER]: 6,
  [TsTxType.WITHDRAW]: 6,
  [TsTxType.AUCTION_LEND]: 0, // TODO: check
  [TsTxType.AUCTION_BORROW]: 0, // TODO: check
  [TsTxType.AUCTION_CANCEL]: 0, // TODO: check
};


export enum TsTokenAddress {
    Unknown = '0',
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

export interface TsTokenInfo {
    tokenAddr: TsTokenAddress;
    amount: bigint;
    lockAmt: bigint;
}
