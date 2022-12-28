import { bufferToBigInt } from './helper';
import { EdDSAPublicKeyType, EdDSASignaturePayload } from './ts-types/eddsa-types';
const circomlibjs = require('circomlibjs');
const ff = require('ffjavascript');

export let EdDSA: any;
export const asyncEdDSA = circomlibjs.buildEddsa();
(async function() {
  EdDSA = await asyncEdDSA;
})();

const bigInt2Buffer = (i: bigint): Buffer => {
  let hexStr = i.toString(16);
  while (hexStr.length < 64) {
    hexStr = '0' + hexStr;
  }
  return Buffer.from(hexStr, 'hex');
};

export class EddsaSigner {
  private privateKey: Buffer;
  public publicKey: EdDSAPublicKeyType;

  constructor(privateKey: Buffer) {
    this.privateKey = privateKey;
    this.publicKey = (privateKey.length === 0) ?  [
      new Uint8Array(), new Uint8Array()
    ] : EdDSA.prv2pub(privateKey);
  }

  static toObject(i: Uint8Array): bigint {
    return EdDSA.babyJub.F.toObject(i);
  }
    
  static toE(i: bigint): Uint8Array {
    return EdDSA.babyJub.F.e(i);
  }

  signPoseidon(msgHash: bigint): EdDSASignaturePayload {
    const msgField = EdDSA.babyJub.F.e(msgHash);
    const signature = EdDSA.signPoseidon(this.privateKey, msgField);
    return signature;
  }

  static verify(msgHash: Uint8Array, signature: EdDSASignaturePayload,publicKey: EdDSAPublicKeyType): boolean {
    return EdDSA.verifyPoseidon(Uint8Array, signature, publicKey);
  }
}
