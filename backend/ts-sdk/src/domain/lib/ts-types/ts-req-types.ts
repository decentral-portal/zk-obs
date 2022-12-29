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
}

/** Client Request Types */

/** Register */
export interface TsTxRegisterRequest extends ITxRequest {
    L2AddrFrom: string;
    L2TokenAddr: TsTokenAddress;
    tsPubKey: [string, string]; // [babyjub.x, babyjub.y]
    amount: string;
}

/** Deposit */
export interface TsTxDepositNonSignatureRequest extends ITxRequest {
    L2AddrFrom: TsSystemAccountAddress.MINT_ADDR;
    L2AddrTo: string;
    L2TokenAddr: TsTokenAddress;
    amount: string;
    nonce: '0';
}
export interface TsTxDepositRequest extends TsTxDepositNonSignatureRequest, TsTxSignaturePayload {
}

/** Transfer */
export interface TsTxTransferNonSignatureRequest extends ITxRequest {
    L2AddrFrom: string;
    L2AddrTo: string;
    L2TokenAddr: TsTokenAddress;
    amount: string;
    nonce: string;
}
export interface TsTxTransferRequest extends TsTxTransferNonSignatureRequest, TsTxSignaturePayload { }

/** Withdraw */
export interface TsTxWithdrawNonSignatureRequest extends ITxRequest {
    L2AddrFrom: string; 
    L2AddrTo: TsSystemAccountAddress.WITHDRAW_ADDR;
    L2TokenAddr: TsTokenAddress;
    amount: string;
    nonce: string;
}
export interface TsTxWithdrawRequest extends TsTxWithdrawNonSignatureRequest, TsTxSignaturePayload { }

/** PlaceOrder */
export interface TsTxAuctionLendNonSignatureRequest extends ITxRequest {
    L2AddrFrom: string;
    L2AddrTo: TsSystemAccountAddress.AUCTION_ADDR;
    L2TokenAddrLending: TsTokenAddress; 
    lendingAmt: string;
    nonce: string;
    maturityDate: string;
    expiredTime: string;
    interest: string;
    txId?: string;
}
export interface TsTxAuctionLendRequest extends TsTxAuctionLendNonSignatureRequest, TsTxSignaturePayload { }

export interface TsTxAuctionBorrowNonSignatureRequest extends ITxRequest {
    L2AddrFrom: string;
    L2AddrTo: TsSystemAccountAddress.AUCTION_ADDR;
    L2TokenAddrCollateral: TsTokenAddress;
    collateralAmt: string;
    nonce: string;
    maturityDate: string;
    expiredTime: string;
    interest: string;
    L2TokenAddrBorrowing: TsTokenAddress;
    borrowingAmt: string;
    txId?: string;
}
export interface TsTxAuctionBorrowRequest extends TsTxAuctionBorrowNonSignatureRequest, TsTxSignaturePayload { }

export interface TsTxAuctionCancelNonSignatureRequest extends ITxRequest {
    L2AddrFrom: TsSystemAccountAddress.AUCTION_ADDR;
    L2AddrTo: string;
    L2TokenAddrRefunded: TsTokenAddress;
    amount: string;
    nonce: string;
    orderLeafId: string;
}
export interface TsTxAuctionCancelRequest extends TsTxAuctionCancelNonSignatureRequest, TsTxSignaturePayload { }

