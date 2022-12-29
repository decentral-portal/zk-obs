import { TsTxAuctionBorrowNonSignatureRequest, TsTxAuctionCancelNonSignatureRequest, 
  TsTxAuctionLendNonSignatureRequest, TsTxDepositNonSignatureRequest, TsTxDepositRequest, 
  TsTxRegisterRequest, TsTxTransferNonSignatureRequest } from './ts-req-types';
import { TsSystemAccountAddress, TsTokenAddress, TsTxType } from './ts-type';

// [L2AddrFrom, L2AddrTo, L2TokenAddr, tokenAmt, nonce, arg0, arg1, arg2, arg3, arg4]
export type TsTxRequestDatasType = [
  bigint,
  bigint, bigint, bigint, bigint, bigint,
  bigint, bigint, bigint, bigint, bigint ]; 

export function encodeTxDepositMessage(txDepositReq: TsTxDepositNonSignatureRequest): TsTxRequestDatasType {
  return [
    BigInt(TsTxType.DEPOSIT),
    BigInt(txDepositReq.L2AddrFrom),
    BigInt(txDepositReq.L2AddrTo),
    BigInt(txDepositReq.L2TokenAddr),
    BigInt(txDepositReq.amount),
    0n,
    0n, 0n, 0n, 0n, 0n, 
  ];
}

export function encodeTxTransferMessage(txTransferReq: TsTxTransferNonSignatureRequest): TsTxRequestDatasType {
  return [
    BigInt(TsTxType.TRANSFER),
    BigInt(txTransferReq.L2AddrFrom),
    BigInt(txTransferReq.L2AddrTo),
    BigInt(txTransferReq.L2TokenAddr),
    BigInt(txTransferReq.amount),
    BigInt(txTransferReq.nonce),
    0n, 0n, 0n, 0n, 0n,
  ];
}

export function encodeTxWithdrawMessage(txTransferReq: TsTxTransferNonSignatureRequest): TsTxRequestDatasType {
  return [
    BigInt(TsTxType.WITHDRAW),
    BigInt(txTransferReq.L2AddrFrom),
    BigInt(txTransferReq.L2AddrTo),
    BigInt(txTransferReq.L2TokenAddr),
    BigInt(txTransferReq.amount),
    BigInt(txTransferReq.nonce),
    0n, 0n, 0n, 0n, 0n,
  ];
}

export function encodeTxAuctionLendMessage(txAuctionLendReq: TsTxAuctionLendNonSignatureRequest): TsTxRequestDatasType {
  return [
    BigInt(TsTxType.AUCTION_LEND),
    BigInt(txAuctionLendReq.L2AddrFrom),
    BigInt(TsSystemAccountAddress.AUCTION_ADDR),
    BigInt(txAuctionLendReq.L2TokenAddrLending),
    BigInt(txAuctionLendReq.lendingAmt),
    BigInt(txAuctionLendReq.nonce),
    BigInt(txAuctionLendReq.maturityDate),
    BigInt(txAuctionLendReq.expiredTime),
    BigInt(txAuctionLendReq.interest),
    0n, 0n,
  ];
}

export function encodeTxAuctionBorrowMessage(txAuctionBorrowReq: TsTxAuctionBorrowNonSignatureRequest): TsTxRequestDatasType {
  return [
    BigInt(TsTxType.AUCTION_BORROW),
    BigInt(txAuctionBorrowReq.L2AddrFrom),
    BigInt(TsSystemAccountAddress.AUCTION_ADDR),
    BigInt(txAuctionBorrowReq.L2TokenAddrCollateral),
    BigInt(txAuctionBorrowReq.collateralAmt),
    BigInt(txAuctionBorrowReq.nonce),
    BigInt(txAuctionBorrowReq.maturityDate),
    BigInt(txAuctionBorrowReq.expiredTime),
    BigInt(txAuctionBorrowReq.interest),
    BigInt(txAuctionBorrowReq.L2TokenAddrBorrowing),
    BigInt(txAuctionBorrowReq.borrowingAmt),
  ];
}

export function encodeTxAuctionCancelMessage(txAuctionCancelReq: TsTxAuctionCancelNonSignatureRequest): TsTxRequestDatasType {
  return [
    BigInt(TsTxType.AUCTION_CANCEL),
    BigInt(TsSystemAccountAddress.AUCTION_ADDR),
    BigInt(txAuctionCancelReq.L2AddrTo),
    BigInt(txAuctionCancelReq.L2TokenAddrRefunded),
    BigInt(txAuctionCancelReq.amount),
    BigInt(txAuctionCancelReq.nonce),
    BigInt(txAuctionCancelReq.orderLeafId),
    0n, 0n, 0n, 0n,
  ];
}

export function getEmptyRegisterTx() {
  const req: TsTxRegisterRequest = {
    reqType: TsTxType.REGISTER,
    L2AddrFrom: TsSystemAccountAddress.BURN_ADDR,
    L2TokenAddr: TsTokenAddress.UNKNOWN,
    tsPubKey: [ '0', '0' ],
    amount: '0',
  };
  return req;
}

export function getEmptyMainTx() {
  const req: TsTxDepositRequest = {
    reqType: TsTxType.DEPOSIT,
    L2AddrFrom: TsSystemAccountAddress.MINT_ADDR,
    L2AddrTo: TsSystemAccountAddress.WITHDRAW_ADDR,
    L2TokenAddr: TsTokenAddress.UNKNOWN,
    amount: '0',
    nonce: '0',
    eddsaSig: {
      R8: ['0', '0'],
      S: '0'
    }
  };
  return req;
} 