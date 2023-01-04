import { toTreeLeaf } from '../ts-rollup/ts-helper';
import { TsTokenAddress, TsTxType } from './ts-types';

export type TsApiResponsePayload<T> = {
  status: number;
  data: T;
  error?: string;
};

export type EdDSASignatureRequestType = {
  R8: [string, string];
  S: string;
};

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
export type TsTxDepositRequest = TsTxDepositNonSignatureRequest;

/** Transfer */

export enum TsSide {
  BUY = '0',
  SELL = '1',
}

/** Withdraw */
export interface TsTxWithdrawNonSignatureRequest extends ITxRequest {
  sender: string;
  tokenId: TsTokenAddress;
  stateAmt: string;
  nonce: string;
}
export interface TsTxWithdrawRequest extends TsTxWithdrawNonSignatureRequest, TsTxSignaturePayload {}

export interface TsTxLimitOrderNonSignatureRequest extends ITxRequest {
  sender: string;
  sellTokenId: TsTokenAddress;
  sellAmt: string;
  nonce: string;
  buyTokenId: TsTokenAddress;
  buyAmt: string;
}
export interface TsTxLimitOrderRequest extends TsTxLimitOrderNonSignatureRequest, TsTxSignaturePayload {}

export interface TsTxLimitStartNonSignatureRequest extends ITxRequest {
  orderLeafId: string;
}
export interface TsTxLimitStartRequest extends TsTxLimitStartNonSignatureRequest, TsTxSignaturePayload {}

export interface TsTxLimitExchangeNonSignatureRequest extends ITxRequest {
  orderLeafId: string;
}
export interface TsTxLimitExchangeRequest extends TsTxLimitExchangeNonSignatureRequest, TsTxSignaturePayload {}

export interface TsTxLimitEndNonSignatureRequest extends ITxRequest {
  orderLeafId: string;
}
export interface TsTxLimitEndRequest extends TsTxLimitEndNonSignatureRequest, TsTxSignaturePayload {}

export interface TsTxMarketOrderNonSignatureRequest extends ITxRequest {
  sender: string;
  sellTokenId: TsTokenAddress;
  sellAmt: string;
  nonce: string;
  buyTokenId: TsTokenAddress;
}
export interface TsTxMarketOrderRequest extends TsTxMarketOrderNonSignatureRequest, TsTxSignaturePayload {}

export interface TsTxMarketExchangeNonSignatureRequest extends ITxRequest {
  orderLeafId: string;
}
export interface TsTxMarketExchangeRequest extends TsTxMarketExchangeNonSignatureRequest, TsTxSignaturePayload {}

export interface TsTxMarketEndNonSignatureRequest extends ITxRequest {
  orderLeafId: string;
}
export interface TsTxMarketEndRequest extends TsTxMarketEndNonSignatureRequest, TsTxSignaturePayload {}

export interface TsTxCancelOrderNonSignatureRequest extends ITxRequest {
  orderLeafId: string;
}
export interface TsTxCancelOrderRequest extends TsTxCancelOrderNonSignatureRequest, TsTxSignaturePayload {}
