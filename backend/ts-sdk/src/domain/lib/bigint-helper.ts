import { CHUNK_BYTES_SIZE } from './ts-types/ts-types';

export const bigIntMax = (arr: bigint[]) => {
  return arr.reduce((max, e) => {
    return e > max ? e : max;
  }, arr[0]);
};

export const bigIntMin = (arr: bigint[]) => {
  return arr.reduce((min, e) => {
    return e > min ? e : min;
  }, arr[0]);
};

export function amountToTxAmountV2(number: bigint): bigint { // 48bit
  const sign = number >> 127n << 47n;
  const fraction = number - sign;
  const fractionLength = BigInt(fraction.toString(2).length);
  const bias = (1n << 5n) - 1n;
  const exp = fractionLength - 28n + bias;
  const modNumber = (fractionLength > 0n) ? 1n << (fractionLength - 1n) : 1n;

  const modifiedFraction = fraction % modNumber;
  const modifiedFractionLength = (fractionLength > 0n) ? fractionLength - 1n : 0n;
  const finalFraction = (modifiedFractionLength < 41n)
    ? modifiedFraction << (41n - modifiedFractionLength)
    : modifiedFraction >> (modifiedFractionLength - 41n);
  const retVal = sign + (exp << 41n) + finalFraction;
  return retVal;
}


export function amountToTxAmountV3_40bit(number: bigint): bigint { // 48bit
  let val_exp = 0n;
  if(number === 0n) {
    return 0n;
  }
  while(number % 10n === 0n) {
    number /= 10n;
    val_exp += 1n;
  }
  return number + (val_exp << 35n);
}

export function arrayChunkToHexString(arr: string[], chunkSize: number = CHUNK_BYTES_SIZE) {
  const hex = arr.map((e) => {
    return BigInt(e).toString(16).padStart(chunkSize * 2, '0');
  }).join('');

  return '0x' + hex;
}

// function toHex(n: string) {
//   const num = BigInt(n);
//   const rawHex = num.toString(16);
//   return '0x' + (rawHex.length % 2 === 0 ? rawHex : '0' + rawHex);
// }
