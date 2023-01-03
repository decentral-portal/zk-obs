import { TsTxDepositNonSignatureRequest, TsTxEntityRequest, TsTxLimitOrderRequest, TsTxRegisterRequest, TsTxWithdrawRequest } from '../ts-types/ts-req-types';
import { TsTxType, TsTokenAddress } from '../ts-types/ts-types';

export type CircuitReqDataType = [
  bigint, bigint,
  bigint, bigint,
  bigint, bigint,
  bigint, bigint,
  bigint, bigint,
]

export function encodeRollupWithdrawMessage(req: TsTxEntityRequest): CircuitReqDataType {
  return [
    BigInt(TsTxType.WITHDRAW),
    BigInt(req.accountId),
    BigInt(req.tokenId),
    BigInt(req.amount),
    BigInt(req.nonce),
    0n,0n,0n,0n,0n,
  ];
}

export function convertRegisterReq2TxEntity(req: TsTxRegisterRequest): TsTxEntityRequest {
  return {
    txId: 1,
    blockNumber: 1,
    reqType: req.reqType,
    accountId: 0n,
    tokenId: BigInt(req.tokenId),
    accumulatedSellAmt: 0n,
    accumulatedBuyAmt: 0n,
    amount: BigInt(req.stateAmt),
    nonce: 0n,
    eddsaSig: {
      R8: ['0', '0'],
      S: '0',
    },
    ecdsaSig: 0n,
    arg0: BigInt(req.sender),
    arg1: BigInt(req.tsAddr),
    arg2: 0n,
    arg3: 0n,
    arg4: 0n,
    fee: 0n,
    feeToken: 0n,
    tokenAddr: req.tokenId,
    tsPubKeyX: req.tsPubKey[0],
    tsPubKeyY: req.tsPubKey[1],
  };
}

export function convertDepositReq2TxEntity(req: TsTxDepositNonSignatureRequest): TsTxEntityRequest {
  return {
    txId: 1,
    blockNumber: 1,
    reqType: req.reqType,
    accountId: 0n,
    tokenId: BigInt(req.tokenId),
    accumulatedSellAmt: 0n,
    accumulatedBuyAmt: 0n,
    amount: BigInt(req.stateAmt),
    nonce: 0n,
    eddsaSig: {
      R8: ['0', '0'],
      S: '0',
    },
    ecdsaSig: 0n,
    arg0: BigInt(req.sender),
    arg1: 0n,
    arg2: 0n,
    arg3: 0n,
    arg4: 0n,
    fee: 0n,
    feeToken: 0n,
    tokenAddr: req.tokenId,
    tsPubKeyX: '0',
    tsPubKeyY: '0',
  };
}

export function convertWithdrawReq2TxEntity(req: TsTxWithdrawRequest, tsPubKey: [bigint, bigint]): TsTxEntityRequest {
  return {
    txId: 1,
    blockNumber: 1,
    reqType: req.reqType,
    accountId: BigInt(req.sender),
    tokenId: BigInt(req.tokenId),
    accumulatedSellAmt: 0n,
    accumulatedBuyAmt: 0n,
    amount: BigInt(req.stateAmt),
    nonce: BigInt(req.nonce),
    eddsaSig: {
      R8: req.eddsaSig.R8,
      S: req.eddsaSig.S,
    },
    ecdsaSig: 0n,
    arg0: 0n,
    arg1: 0n,
    arg2: 0n,
    arg3: 0n,
    arg4: 0n,
    fee: 0n,
    feeToken: 0n,
    tokenAddr: req.tokenId,

    tsPubKeyX: tsPubKey[0].toString(),
    tsPubKeyY: tsPubKey[1].toString(),
  };
}


export function convertLimitOrderReq2TxEntity(txId: number, req: TsTxLimitOrderRequest): TsTxEntityRequest {
  return {
    txId,
    reqType: req.reqType,
    accountId: BigInt(req.sender),
    tokenId: BigInt(req.sellTokenId),
    amount: BigInt(req.sellAmt),
    nonce: BigInt(req.nonce),
    eddsaSig: {
      R8: req.eddsaSig.R8,
      S: req.eddsaSig.S,
    },
    ecdsaSig: 0n,
    accumulatedSellAmt: 0n,
    accumulatedBuyAmt: 0n,
    arg0: 0n,
    arg1: 0n,
    arg2: BigInt(req.buyTokenId),
    arg3: BigInt(req.buyAmt),
    arg4: 0n,
    fee: 0n,
    feeToken: 0n,
    tokenAddr: BigInt(req.sellTokenId).toString() as TsTokenAddress,
    tsPubKeyX: '0',
    tsPubKeyY: '0',
  };
}