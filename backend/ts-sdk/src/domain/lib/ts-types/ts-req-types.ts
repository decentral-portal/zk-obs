import { toTreeLeaf } from '../ts-rollup/ts-helper';
import { TsSystemAccountAddress, TsTokenAddress, TsTxType } from './ts-types';

export type TsApiResponsePayload<T> = {
    status: number,
    data: T,
    error?: string,
}

export type EdDSASignatureRequestType = {
    R8: [string, string],
    S: string
}

export interface ITxRequest {
    reqType: TsTxType;
}

export interface TsTxSignaturePayload {
    eddsaSig: EdDSASignatureRequestType;
    ecdsaSig?: string;
    // tsPubKey: [string, string];
}

/** Client Request Types */

/** Register */
export interface TsTxRegisterRequest extends ITxRequest {
  L1Addr: string;
  tokenId: TsTokenAddress;
  stateAmt: string;
  sender: string;
  tsPubKey: [string, string];
  tsAddr: string;
}

/** Deposit */
export interface TsTxDepositNonSignatureRequest extends ITxRequest {
  tokenId: TsTokenAddress;
  stateAmt: string;
  sender: string;
}
export type TsTxDepositRequest = TsTxDepositNonSignatureRequest

/** Transfer */
// TODO: replace with TsTxEntityRequest
export interface TsTxEntityRequest {
  txId: number;
  blockNumber?: number;
  reqType: TsTxType;
  accountId: bigint;
  tokenId: bigint;
  accumulatedSellAmt: bigint;
  accumulatedBuyAmt: bigint;
  amount: bigint;
  nonce: bigint;
  eddsaSig: {
    R8: [string, string];
    S: string;
  };
  ecdsaSig: bigint;
  arg0: bigint;
  arg1: bigint;
  arg2: bigint;
  arg3: bigint;
  arg4: bigint;
  fee: bigint;
  feeToken: bigint;

  tsPubKeyX: string;
  tsPubKeyY: string;

  tokenAddr: TsTokenAddress;
}
export enum TsSide {
  BUY = '0',
  SELL = '1',
}
export class ObsOrderLeaf {
  txId!: bigint;
  reqType!: TsTxType;
  sender!: bigint;
  sellTokenId!: bigint;
  sellAmt!: bigint;
  nonce!: bigint;

  buyTokenId!: bigint;
  buyAmt!: bigint;
  accumulatedSellAmt!: bigint;
  accumulatedBuyAmt!: bigint;
  orderLeafId!: bigint;

  constructor(
    txId: bigint,
    reqType: TsTxType,
    sender: bigint,
    sellTokenId: bigint,
    sellAmt: bigint,
    nonce: bigint,
    buyTokenId: bigint,
    buyAmt: bigint,
    accumulatedSellAmt: bigint,
    accumulatedBuyAmt: bigint,
    // orderLeafId: bigint,
  ) {
    this.txId = txId;
    this.reqType = reqType;
    this.sender = sender;
    this.sellTokenId = sellTokenId;
    this.sellAmt = sellAmt;
    this.nonce = nonce;
    this.buyTokenId = buyTokenId;
    this.buyAmt = buyAmt;
    this.accumulatedSellAmt = accumulatedSellAmt;
    this.accumulatedBuyAmt = accumulatedBuyAmt;
    // this.orderLeafId = orderLeafId;
  }
  
  setOrderLeafId(orderLeafId: bigint) {
    this.orderLeafId = orderLeafId;
  }

  encodeLeafMessage() {
    return [
      BigInt(this.reqType),
      this.sender,
      this.sellTokenId,
      this.sellAmt,
      this.nonce,
      0n,
      0n,
      this.buyTokenId,
      this.buyAmt,
      0n,
      this.txId,
      this.accumulatedSellAmt,
      this.accumulatedBuyAmt,
    ];
  }

  encodeLeafMessageForHash() {
    return toTreeLeaf(this.encodeLeafMessage());
  }
}

/** Withdraw */
export interface TsTxWithdrawNonSignatureRequest extends ITxRequest {
  sender: string;
  tokenId: TsTokenAddress;
  stateAmt: string;
  nonce: string;
}
export interface TsTxWithdrawRequest extends TsTxWithdrawNonSignatureRequest, TsTxSignaturePayload { }

export interface TsTxLimitOrderNonSignatureRequest extends ITxRequest {
  sender: string;
  sellTokenId: TsTokenAddress;
  sellAmt: string;
  nonce: string;
  buyTokenId: TsTokenAddress;
  buyAmt: string;
}
export interface TsTxLimitOrderRequest extends TsTxLimitOrderNonSignatureRequest, TsTxSignaturePayload { }

export interface TsTxLimitStartNonSignatureRequest extends ITxRequest {
  orderLeafId: string;
}
export interface TsTxLimitStartRequest extends TsTxLimitStartNonSignatureRequest, TsTxSignaturePayload { }

export interface TsTxLimitExchangeNonSignatureRequest extends ITxRequest {
  orderLeafId: string;
}
export interface TsTxLimitExchangeRequest extends TsTxLimitExchangeNonSignatureRequest, TsTxSignaturePayload { }

export interface TsTxLimitEndNonSignatureRequest extends ITxRequest {
  orderLeafId: string;
}
export interface TsTxLimitEndRequest extends TsTxLimitEndNonSignatureRequest, TsTxSignaturePayload { }

export interface TsTxMarketOrderNonSignatureRequest extends ITxRequest {
  sender: string;
  sellTokenId: TsTokenAddress;
  sellAmt: string;
  nonce: string;
  buyTokenId: TsTokenAddress;
}
export interface TsTxMarketOrderRequest extends TsTxMarketOrderNonSignatureRequest, TsTxSignaturePayload { }

export interface TsTxMarketExchangeNonSignatureRequest extends ITxRequest {
  orderLeafId: string;
}
export interface TsTxMarketExchangeRequest extends TsTxMarketExchangeNonSignatureRequest, TsTxSignaturePayload { }

export interface TsTxMarketEndNonSignatureRequest extends ITxRequest {
  orderLeafId: string;
}
export interface TsTxMarketEndRequest extends TsTxMarketEndNonSignatureRequest, TsTxSignaturePayload { }

export interface TsTxCancelOrderNonSignatureRequest extends ITxRequest {
  orderLeafId: string;
}
export interface TsTxCancelOrderRequest extends TsTxCancelOrderNonSignatureRequest, TsTxSignaturePayload { }

