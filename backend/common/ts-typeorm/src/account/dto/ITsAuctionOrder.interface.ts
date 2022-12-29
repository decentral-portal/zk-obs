import { EdDSASignatureRequestType } from './ts-req-types';
import { TsSystemAccountAddress, TsTokenAddress, TsTxType } from './ts-type';

export interface ITsAuctionOrder {
  orderId: number;
  txId: bigint;
  reqType: TsTxType.AUCTION_LEND | TsTxType.AUCTION_BORROW | TsTxType.UNKNOWN;
  L2AddrFrom: bigint;
  L2AddrTo: TsSystemAccountAddress.AUCTION_ADDR;
  L2TokenAddrLending: TsTokenAddress;
  L2TokenAddrTSL: TsTokenAddress;
  interest: bigint;
  lendingAmt: bigint;
  L2TokenAddrCollateral: TsTokenAddress;
  collateralAmt: bigint;
  expiredTime: Date;
  eddsaSig: EdDSASignatureRequestType;
  timestamp: number;
  maturityDate: string;
  encode(): bigint[];
  encodeOrderLeaf(): string;
}