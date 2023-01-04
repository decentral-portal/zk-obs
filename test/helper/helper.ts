import { ethers, BigNumber } from 'ethers';

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
  const commitmentMessage = ethers.utils.solidityPack(
    ['bytes32', 'bytes32', 'bytes32', 'bytes'],
    [oriStateRoot, newStateRoot, newTsRoot, pubdata],
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

export function getRollupData(inputs: any, root: any, calldata: any) {
  const pubKeyX = BigNumber.from(inputs.tsPubKey[0][0]);
  const pubKeyY = BigNumber.from(inputs.tsPubKey[0][1]);
  const amount: BigNumber = BigNumber.from(inputs.reqData[0][3]);
  const oriStateRoot = root.oriStateRoot;
  const newStateRoot = root.newStateRoot;
  const newTsRoot = root.newTsRoot;
  const o_chunk = root.o_chunk;
  const { commitment, commitmentMessage, commitmentHashOrigin } =
    stateToCommitment(root);
  // console.log({ commitmentMessage });
  const proof_a = [
    BigNumber.from(calldata[0][0]),
    BigNumber.from(calldata[0][1]),
  ];
  const proof_b = [
    [BigNumber.from(calldata[1][0][0]), BigNumber.from(calldata[1][0][1])],
    [BigNumber.from(calldata[1][1][0]), BigNumber.from(calldata[1][1][1])],
  ];
  const proof_c = [
    BigNumber.from(calldata[2][0]),
    BigNumber.from(calldata[2][1]),
  ];
  const proof_commitment = [BigNumber.from(calldata[3][0])];
  let pubdataOffset = [];
  for (let i = 0; i < root.isCriticalChunk.length; i++) {
    if (root.isCriticalChunk[i] == '1') {
      pubdataOffset.push((Math.floor(i / 2) - 1) * 12);
    }
  }
  // console.log({ pubdataOffset });
  return {
    pubKeyX,
    pubKeyY,
    amount,
    oriStateRoot,
    newStateRoot,
    newTsRoot,
    commitmentHashOrigin,
    o_chunk,
    pubdataOffset,
    proof_a,
    proof_b,
    proof_c,
    proof_commitment,
  };
}

export function amountToTxAmountV3_40bit(number: bigint): bigint {
  // 48bit
  let val_exp = 0n;
  if (number === 0n) {
    return 0n;
  }
  while (number % 10n === 0n) {
    number /= 10n;
    val_exp += 1n;
  }
  return number + (val_exp << 35n);
}
