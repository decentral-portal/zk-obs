import { TransactionInfo } from '@common/ts-typeorm/account/transactionInfo.entity';
import { utils } from 'ethers';

import { TsTxType } from '../ts-types/ts-types';

export type CircuitReqDataType = [bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint];

export function encodeRollupWithdrawMessage(req: TransactionInfo): CircuitReqDataType {
  return [BigInt(TsTxType.WITHDRAW), BigInt(req.accountId), BigInt(req.tokenId), BigInt(req.amount), BigInt(req.nonce), 0n, 0n, 0n, 0n, 0n];
}


export function stateToCommitment({
  oriStateRoot,
  newStateRoot,
  newTsRoot,
  pubdata,
}: {
  oriStateRoot: string;
  newStateRoot: string;
  newTsRoot: string;
  pubdata: string;
}) {
  const commitmentMessage = utils.solidityPack(
    ['bytes32', 'bytes32', 'bytes32', 'bytes'],
    [oriStateRoot, newStateRoot, newTsRoot, pubdata],
  );
  const commitmentHashOrigin = utils.sha256(commitmentMessage);

  const commitment = toHex(
    BigInt(
      '0b' +
        BigInt(commitmentHashOrigin).toString(2).padStart(256, '0').slice(3),
    ),
  );

  return {
    commitmentMessage,
    commitmentHashOrigin,
    commitment,
  };
}

export function toHex(n: string | bigint) {
  const num = typeof n === 'bigint' ? n : BigInt(n as string);
  const rawHex = num.toString(16);
  return '0x' + (rawHex.length % 2 === 0 ? rawHex : '0' + rawHex);
}
