import { TS_STATUS } from 'common/ts-typeorm/src/account/tsStatus.enum';
import { TransactionInfo } from '@common/ts-typeorm/account/transactionInfo.entity';

export const LEN_OF_REQUEST = 10;
export const CHUNK_BYTES_SIZE = 12;
export const CHUNK_BITS_SIZE = CHUNK_BYTES_SIZE * 8;
export const MIN_CHUNKS_PER_REQ = 3;
export const MAX_CHUNKS_PER_REQ = 9;
export const MAX_CHUNKS_BYTES_PER_REQ = MAX_CHUNKS_PER_REQ * CHUNK_BYTES_SIZE;
export function getOChunksSize(batchSize: number) {
  return MAX_CHUNKS_PER_REQ * batchSize;
}

export type TsTxRequestDatasType = [bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint];
export type TokenLeafEncodeType = [bigint, bigint];
export type AccountLeafEncodeType = [bigint, bigint, bigint];
export type ObsOrderLeafEncodeType = [
  bigint, bigint, bigint, bigint, bigint,
  bigint, bigint, bigint, bigint, bigint,
  bigint, bigint, bigint,
];

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
  UNKNOWN = 0,
  NOOP = 0,
  REGISTER = 1,
  DEPOSIT = 2,
  // TRANSFER = '3',
  WITHDRAW = 3,
  SecondLimitOrder = 4,
  SecondLimitStart = 5,
  SecondLimitExchange = 6,
  SecondLimitEnd = 7,
  SecondMarketOrder = 8,
  SecondMarketExchange = 9,
  SecondMarketEnd = 10,
  CancelOrder = 11,

  AUCTION_LEND = 99,
  AUCTION_BORROW = 100,
  AUCTION_CANCEL = 101,
}

export const TsDeciaml = {
  TS_TOKEN_AMOUNT_DEC: 18,
  TS_INTEREST_DEC: 6,
};

export enum TsTokenAddress {
  Unknown = '0',
  WETH = '1',
  USDT = '2',
}

export interface TsTokenInfo {
  amount: bigint;
  lockAmt: bigint;
}

export const TxNoop: TransactionInfo = {
  reqType: Number(TsTxType.UNKNOWN),
  txId: 0,
  accountId: 0n,
  tokenId: 0n,
  accumulatedSellAmt: 0n,
  accumulatedBuyAmt: 0n,
  amount: 0n,
  nonce: 0n,
  eddsaSig: {
    R8: ['0', '0'],
    S: '0',
  },
  ecdsaSig: '0',
  arg0: 0n,
  arg1: 0n,
  arg2: 0n,
  arg3: 0n,
  arg4: 0n,
  fee: 0n,
  feeToken: 0n,
  tsPubKeyX: '',
  tsPubKeyY: '',
  blockNumber: null,
  metadata: null,
  txStatus: TS_STATUS.PENDING,
  L2AccountInfo: {} as any,
  blockInfo: {} as any,
  matchedOrder: null,
  // matchedOrder2: null,
  createdAt: new Date(0),
  createdBy: null,
  updatedAt: new Date(0),
  updatedBy: null,
  deletedAt: null,
  deletedBy: null,
  tokenAddr: TsTokenAddress.Unknown,
};
