import { ethers } from 'ethers';

export function stateToCommitment(state: any) {
  const commitmentMessage = ethers.utils.solidityPack(
    ['bytes32', 'bytes32', 'bytes32', 'bytes'],
    [state.oriStateRoot, state.newStateRoot, state.newTsRoot, state.pubdata],
  );
  const commitmentHashOrigin = ethers.utils.sha256(commitmentMessage);

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

export function toHex(n: string | BigInt) {
  const num = typeof n === 'bigint' ? n : BigInt(n as string);
  const rawHex = num.toString(16);
  return '0x' + (rawHex.length % 2 === 0 ? rawHex : '0' + rawHex);
}
