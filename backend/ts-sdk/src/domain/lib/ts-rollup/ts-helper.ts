import { BytesLike } from 'ethers';
import { recursiveToString, bigint_to_hex } from '../helper';
import { dpPoseidonHash } from '../poseidon-hash-dp';

const exclude: any = {};
export const tsHashFunc = poseidonHash;

export function txToCircuitInput(obj: any, initData: any = {}) {
  const result: any = initData;
  Object.keys(obj).forEach((key) => {
    if(exclude[key]) {
      return;
    }

    const item = obj[key];
    if(!result[key]) {
      result[key] = [];
    }

    result[key].push(recursiveToString(item));
  });

  return result;
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
