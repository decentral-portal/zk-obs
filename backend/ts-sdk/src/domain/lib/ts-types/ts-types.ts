export const LEN_OF_REQUEST = 10;
export const CHUNK_BYTES_SIZE = 12;
export const CHUNK_BITS_SIZE = CHUNK_BYTES_SIZE * 8;
export const MIN_CHUNKS_PER_REQ = 3;
export const MAX_CHUNKS_PER_REQ = 9;
export const MAX_CHUNKS_BYTES_PER_REQ = MAX_CHUNKS_PER_REQ * CHUNK_BYTES_SIZE;
export function getOChunksSize(batchSize: number) {
  return MAX_CHUNKS_PER_REQ * batchSize;
}

export enum TsSystemAccountAddress {
  BURN_ADDR = '0',
  MINT_ADDR = '0',
  WITHDRAW_ADDR = '0',
  AUCTION_ADDR = '0',
}

export const TsDefaultValue = {
  NONCE_ZERO: '0',
  BIGINT_DEFAULT_VALUE: 0n,
  STRING_DEFAULT_VALUE: '0',
  ADDRESS_DEFAULT_VALUE: '0x00',
};


export enum TsTxType {
  UNKNOWN = '0',
  NOOP = '0',
  REGISTER = '1',
  DEPOSIT = '2',
  // TRANSFER = '3',
  WITHDRAW = '3',
  SecondLimitOrder = '4',
  SecondLimitStart = '5',
  SecondLimitExchange = '6',
  SecondLimitEnd = '7',
  SecondMarketOrder = '8',
  SecondMarketExchange = '9',
  SecondMarketEnd = '10',
  CancelOrder = '11',

  AUCTION_LEND = '99',
  AUCTION_BORROW = '100',
  AUCTION_CANCEL = '101'
}

export const TsDeciaml = {
  TS_TOKEN_AMOUNT_DEC: 18,
  TS_INTEREST_DEC: 6,
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
    amount: bigint;
    lockAmt: bigint;
}
