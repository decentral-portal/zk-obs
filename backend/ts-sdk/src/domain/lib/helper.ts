import { utils, BigNumber } from 'ethers';
import { EddsaSigner } from './eddsa';
import { EdDSAPublicKeyType, EdDSASignaturePayload } from './ts-types/eddsa-types';
import { EdDSASignatureRequestType } from './ts-types/ts-req-types';
const NumberOfBits = 256;

export const hexToDec = (hex: string) => {
  return BigNumber.from(hex).toString();
};

export const privateKeyToAddress = (_privateKey: string) => {
  const address = utils.computeAddress(_privateKey);
  return address;
};

export function genEthereumPrivateKey() {
  const privateKey = uint8ArrayToHexString(utils.randomBytes(32));
  return privateKey;
}

export function stringToUint8Array(str: string) {
  const ret: Uint8Array = new Uint8Array(str.length);
  for (let idx = 0; idx < str.length; idx++) {
    ret[idx] = str.charCodeAt(idx);
  }
  return ret;
}

export function bigint_to_Uint8Array(x: bigint) {
  const ret: Uint8Array = new Uint8Array(32);
  for (let idx = 31; idx >= 0; idx--) {
    ret[idx] = Number(x % 256n);
    x = x / 256n;
  }
  return ret;
}

export function Uint8Array_to_bigint(x: Uint8Array) {
  let ret = 0n;
  for (let idx = 0; idx < x.length; idx++) {
    ret = ret * 256n;
    ret = ret + BigInt(x[idx]);
  }
  return ret;
}

export function privKeyStringToBigInt(privKeyHex: string) {
  const privKeyBytes = utils.arrayify(privKeyHex);
  const privKeyNum = Uint8Array_to_bigint(privKeyBytes);
  return privKeyNum;
}

export function bufferToDec(buffer: Buffer) {
  const hex = bufferIsEmpty(buffer) ? '0x0' : '0x' + buffer.toString('hex');
  return BigNumber.from(hex).toString();
}

export function bufferIsEmpty(buffer: Buffer) {
  return buffer.length === 0;
}

export function hexToUint8Array(hex: string) {
  return utils.arrayify(hex);
}

export function bigint_to_tuple(x: bigint) {
  const mod: bigint = 2n ** 64n;
  const ret: [bigint, bigint, bigint, bigint] = [0n, 0n, 0n, 0n];

  let x_temp: bigint = x;
  for (let idx = 0; idx < ret.length; idx++) {
    ret[idx] = x_temp % mod;
    x_temp = x_temp / mod;
  }
  return ret;
}

export function bigint_to_hex(x: bigint) {
  return '0x' + x.toString(16);
}

export function objectToHexString(obj: object) {
  const hex = utils.hexlify(utils.toUtf8Bytes(JSON.stringify(obj)));
  return hex;
}



export function uint8ArrayToBuffer(acc1PrivateKey: Uint8Array): Buffer {
  return Buffer.from(acc1PrivateKey);
}

export function hexToBuffer(L2MintAccountPriv: string): Buffer {
  L2MintAccountPriv = L2MintAccountPriv.replace('0x', '');
  return Buffer.from(L2MintAccountPriv, 'hex');
}

export function recursiveToString(data: any): any {
  if (data instanceof Array) {
    return data.map(t => recursiveToString(t));
  }

  if (typeof data === 'bigint') {
    return data.toString(10);
    // return bigintToDecString(data);
  }

  if (typeof data === 'string') {

    if (/[0-9A-Fa-f]{6}/g.test(data) || /^0x/g.test(data)) {
      return hexToDec(data);
    }

    return data;
  }

  return data.toString();
}

export function uint8ArrayToBigint(uint8Array: Uint8Array, numberOfBits: number = NumberOfBits): bigint {
  return BigInt('0x' + Buffer.from(uint8Array).toString('hex'));
}

export function bigintToUint8Array(value: bigint, numberOfBits: number = NumberOfBits): Uint8Array {
  if (numberOfBits % 8) throw new Error('Only 8-bit increments are supported when (de)serializing a bigint.');
  const valueAsHexString = bigintToHexString(value, numberOfBits);
  return hexStringToUint8Array(valueAsHexString);
}

export function bigintToHexString(value: bigint, numberOfBits: number = NumberOfBits): string {
  if (numberOfBits % 8) throw new Error('Only 8-bit increments are supported when (de)serializing a bigint.');
  const valueToSerialize = twosComplement(value, numberOfBits);
  return unsignedBigintToHexString(valueToSerialize, numberOfBits);
}

function validateAndNormalizeHexString(hex: string): string {
  const match = new RegExp('^(?:0x)?([a-fA-F0-9]*)$').exec(hex);
  if (match === null) throw new Error(`Expected a hex string encoded byte array with an optional '0x' prefix but received ${hex}`);
  if (match.length % 2) throw new Error('Hex string encoded byte array must be an even number of charcaters long.');
  return `0x${match[1]}`;
}

export function uint8ArrayToHexString(array: Uint8Array): string {
  const hexStringFromByte = (byte: number): string => ('00' + byte.toString(16)).slice(-2);
  const appendByteToString = (value: string, byte: number) => value + hexStringFromByte(byte);
  return array.reduce(appendByteToString, '');
}

function hexStringToUint8Array(hex: string): Uint8Array {
  const match = new RegExp('^(?:0x)?([a-fA-F0-9]*)$').exec(hex);
  if (match === null) throw new Error(`Expected a hex string encoded byte array with an optional '0x' prefix but received ${hex}`);
  if (match.length % 2) throw new Error('Hex string encoded byte array must be an even number of charcaters long.');
  const normalized = match[1];
  const byteLength = normalized.length / 2;
  const bytes = new Uint8Array(byteLength);
  for (let i = 0; i < byteLength; ++i) {
    bytes[i] = (Number.parseInt(`${normalized[i * 2]}${normalized[i * 2 + 1]}`, 16));
  }
  return bytes;
}

function unsignedBigintToHexString(value: bigint, bits: number): string {
  const byteSize = bits / 8;
  const hexStringLength = byteSize * 2;
  return ('0'.repeat(hexStringLength) + value.toString(16)).slice(-hexStringLength);
}

function twosComplement(value: bigint, numberOfBits: number = NumberOfBits): bigint {
  const mask = 2n ** (BigInt(numberOfBits) - 1n) - 1n;
  return (value & mask) - (value & ~mask);
}

export const eddsaSigTypeConverter = (
  sig: EdDSASignaturePayload
): EdDSASignatureRequestType => {
  return {
    R8: [EddsaSigner.toObject(sig.R8[0]).toString(), EddsaSigner.toObject(sig.R8[1]).toString()],
    S: sig.S.toString(),
  };
};

export const tsPubKeyTypeConverter = (tsPubKey: [bigint, bigint]): EdDSAPublicKeyType => {
  return [EddsaSigner.toE(tsPubKey[0]), EddsaSigner.toE(tsPubKey[1])];
};

export default {
  hexToDec,
  genEthereumPrivateKey,
  privateKeyToAddress,
  uint8ArrayToHexString,
  stringToUint8Array,
  bigint_to_Uint8Array,
  Uint8Array_to_bigint,
  privKeyStringToBigInt,
  bufferToDec,
  bufferIsEmpty,
  hexToUint8Array,
  bigint_to_tuple,
  bigint_to_hex,
  objectToHexString,
  uint8ArrayToBuffer,
  hexToBuffer,
  uint8ArrayToBigint,
  recursiveToString,
  eddsaSigTypeConverter,
};

export function bufferToBigInt(buffer: Buffer) {
  return BigInt('0x' + buffer.toString('hex'));
}