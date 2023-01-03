import { TransactionInfo } from '@common/ts-typeorm/account/transactionInfo.entity';
import { TsTxDepositNonSignatureRequest, TsTxLimitOrderRequest, TsTxRegisterRequest, TsTxWithdrawRequest } from '../ts-types/ts-req-types';
import { TsTxType, TsTokenAddress } from '../ts-types/ts-types';

export type CircuitReqDataType = [bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint];

export function encodeRollupWithdrawMessage(req: TransactionInfo): CircuitReqDataType {
  return [BigInt(TsTxType.WITHDRAW), BigInt(req.accountId), BigInt(req.tokenId), BigInt(req.amount), BigInt(req.nonce), 0n, 0n, 0n, 0n, 0n];
}