import { toTreeLeaf } from '@ts-sdk/domain/lib/ts-rollup/ts-helper';
import { AccountLeafEncodeType, ObsOrderLeafEncodeType, TokenLeafEncodeType } from '@ts-sdk/domain/lib/ts-types/ts-types';
// const cache: {[key: string]: string} = {};

export function getDefaultAccountLeafMessage(tokenRoot: string): AccountLeafEncodeType {
  return [0n, 0n, BigInt(tokenRoot)];
}
export function getDefaultTokenLeafMessage(): TokenLeafEncodeType {
  return [0n, 0n];
}
export function getDefaultObsOrderLeafMessage(): ObsOrderLeafEncodeType {
  return [
    0n, 0n, 0n, 0n, 0n,
    0n, 0n, 0n, 0n, 0n,
    0n, 0n, 0n,
  ];
}


export function getDefaultAccountLeaf(tokenRoot: string) {
  return toTreeLeaf(getDefaultAccountLeafMessage(tokenRoot));
}
export function getDefaultTokenLeaf() {
  return toTreeLeaf(getDefaultTokenLeafMessage());
}

export function getDefaultObsOrderLeaf() {
  return toTreeLeaf(getDefaultObsOrderLeafMessage());
}

// export function getDefaultAccountTreeRoot(height: number, tokenRoot: string): string {
//   if(!cache[`DefaultAccountTreeRoot_${height}`]) {
//     const mk = new TsMerkleTree([], height, tsHashFunc, getDefaultAccountLeaf(tokenRoot));
//     cache[`DefaultAccountTreeRoot_${height}`] = mk.getRoot();
//   }
//   return cache[`DefaultTokenTreeRoot_${height}`];
// }
// export function getDefaultTokenTreeRoot(height: number): string {
//   if(!cache[`DefaultTokenTreeRoot_${height}`]) {
//     const mk = new TsMerkleTree([], height, tsHashFunc, getDefaultTokenLeaf());
//     cache[`DefaultTokenTreeRoot_${height}`] = mk.getRoot();
//   }
//   return cache[`DefaultTokenTreeRoot_${height}`];
// }
// export function getDefaultObsOrderTreeRoot(height: number): string {
//   if(!cache[`DefaultObsOrderTreeRoot_${height}`]) {
//     const mk = new TsMerkleTree([], height, tsHashFunc, getDefaultObsOrderLeaf());
//     cache[`DefaultObsOrderTreeRoot_${height}`] = mk.getRoot();
//   }
//   return cache[`DefaultObsOrderTreeRoot_${height}`];
// }