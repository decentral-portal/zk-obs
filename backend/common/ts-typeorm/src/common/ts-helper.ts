import { BytesLike } from 'ethers';
import { dpPoseidonHash } from './poseiden-hash-dp';

export function bigint_to_hex(x: bigint) {
  return '0x' + x.toString(16);
}

export function toTreeLeaf(inputs: bigint[]) {
  return bigint_to_hex(dpPoseidonHash(inputs));
}

function poseidonHash(val : BytesLike | BytesLike[]): string {
  if (val instanceof Array) {
    const inputs = val.map((v : any) => BigInt(v));
    return bigint_to_hex(dpPoseidonHash(inputs));
  }

  return  bigint_to_hex(dpPoseidonHash([BigInt(val.toString())]));
}

export const tsHashFunc = poseidonHash;
