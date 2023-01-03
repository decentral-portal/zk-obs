import { BigNumber, ethers } from 'ethers';
import { recursiveToString } from '../helper';
import { TsRollupCircuitInputType } from '../ts-types/ts-circuit-types';
import { TsTokenLeafType } from '../ts-types/ts-merkletree.types';
import { TsTxCancelOrderNonSignatureRequest, TsTxDepositNonSignatureRequest, TsTxDepositRequest, TsTxLimitOrderNonSignatureRequest, TsTxMarketOrderNonSignatureRequest, TsTxRegisterRequest, TsTxEntityRequest, TsTxWithdrawNonSignatureRequest } from '../ts-types/ts-req-types';
import { CHUNK_BYTES_SIZE, MAX_CHUNKS_BYTES_PER_REQ, TsSystemAccountAddress, TsTokenAddress, TsTokenInfo, TsTxType } from '../ts-types/ts-types';
import { txToCircuitInput } from './ts-helper';
import { amountToTxAmountV3_40bit } from '../bigint-helper';

// [L2AddrFrom, L2AddrTo, L2TokenAddr, tokenAmt, nonce, arg0, arg1, arg2, arg3, arg4]
export type TsTxRequestDatasType = [
  bigint, bigint, bigint, bigint, bigint,
  bigint, bigint, bigint, bigint, bigint 
]; 

export function exportTransferCircuitInput(txLogs: any[], oriTxNum: bigint, accountRootFlow: bigint[], orderRootFlow: bigint[]): TsRollupCircuitInputType {
  const inputs = txsToRollupCircuitInput(txLogs) as any;

  // TODO: type check
  inputs['oriTxNum'] = oriTxNum.toString();
  inputs['accountRootFlow'] = accountRootFlow.map(x => recursiveToString(x));
  inputs['orderRootFlow'] = orderRootFlow.map(x => recursiveToString(x));
  return inputs;
}


export function txsToRollupCircuitInput<T, B>(obj: any[], initData: any = {}): TsRollupCircuitInputType {
  obj.forEach((item) => {
    txToCircuitInput(item, initData);
  });
  return initData;
}


export function encodeTxDepositMessage(txDepositReq: TsTxDepositNonSignatureRequest): TsTxRequestDatasType {
  return [
    BigInt(TsTxType.DEPOSIT),
    BigInt(txDepositReq.sender),
    BigInt(txDepositReq.tokenId),
    BigInt(txDepositReq.stateAmt),
    0n,
    0n, 0n, 0n, 0n, 0n, 
  ];
}

// export function encodeTxTransferMessage(txTransferReq: TsTxTransferNonSignatureRequest): TsTxRequestDatasType {
//   return [
//     BigInt(TsTxType.TRANSFER),
//     BigInt(txTransferReq.L2AddrFrom),
//     BigInt(txTransferReq.L2TokenAddr),
//     BigInt(txTransferReq.txAmount || 0),
//     BigInt(txTransferReq.nonce),
//     BigInt(txTransferReq.L2AddrTo),
//     0n, 0n, 0n, 0n,
//   ];
// }

export function encodeTxWithdrawMessage(txTransferReq: TsTxWithdrawNonSignatureRequest): TsTxRequestDatasType {
  return [
    BigInt(TsTxType.WITHDRAW),
    BigInt(txTransferReq.sender),
    BigInt(txTransferReq.tokenId),
    BigInt(txTransferReq.stateAmt),
    BigInt(txTransferReq.nonce),
    0n, 0n, 0n, 0n, 0n,
  ];
}

export function getEmptyRegisterTx() {
  const req: TsTxRegisterRequest = {
    sender: '0',
    reqType: TsTxType.REGISTER,
    tokenId: TsTokenAddress.Unknown,
    tsAddr: '0',
    stateAmt: '0',
    L1Addr: '0x00',
    tsPubKey: ['0', '0']
  };
  return req;
}

export function encodeTsTxLimitOrderMessage(txLimitOrderReq: TsTxLimitOrderNonSignatureRequest): TsTxRequestDatasType {
  return [
    BigInt(TsTxType.SecondLimitOrder),
    BigInt(txLimitOrderReq.sender),
    BigInt(txLimitOrderReq.sellTokenId),
    BigInt(txLimitOrderReq.sellAmt),
    BigInt(txLimitOrderReq.nonce),
    0n, 0n, // arg0, arg1,
    BigInt(txLimitOrderReq.buyTokenId), // arg2
    BigInt(txLimitOrderReq.buyAmt), // arg3
    0n, // arg4
  ];
}

export function encodeTsTxMarketOrderMessage(txMarketOrderReq: TsTxMarketOrderNonSignatureRequest): TsTxRequestDatasType {
  return [
    BigInt(TsTxType.SecondMarketOrder),
    BigInt(txMarketOrderReq.sender),
    BigInt(txMarketOrderReq.sellTokenId),
    BigInt(txMarketOrderReq.sellAmt),
    BigInt(txMarketOrderReq.nonce),
    0n, 0n, // arg0, arg1,
    BigInt(txMarketOrderReq.buyTokenId), // arg2
    0n, // arg3
    0n, // arg4
  ];
}

export function encodeTxCancelOrderMessage(txCancelOrderReq: TsTxCancelOrderNonSignatureRequest): TsTxRequestDatasType {
  return [
    BigInt(TsTxType.CancelOrder),
    0n,
    0n,
    0n,
    0n,
    0n, 0n, // arg0, arg1,
    0n, // arg2
    0n, // arg3
    BigInt(txCancelOrderReq.orderLeafId), // arg4
  ];
}

export function encodeTokenLeaf(token: TsTokenInfo): TsTokenLeafType {
  return [
    BigInt(token.amount),
    BigInt(token.lockAmt),
  ];
}

export function encodeRChunkBuffer(txTransferReq: TsTxEntityRequest, metadata?: {
  txOffset: bigint,
  buyAmt: bigint,
}) {
  
  switch (txTransferReq.reqType) {
    case TsTxType.REGISTER:
      if(!txTransferReq.arg0) {
        throw new Error('arg0 is required');
      }
      if(!txTransferReq.arg1) {
        throw new Error('hashedTsPubKey is required');
      }
      const out_r = ethers.utils.solidityPack(
        ['uint8', 'uint32', 'uint16', 'uint128', 'uint160',],
        [
          BigNumber.from(txTransferReq.reqType),
          BigNumber.from(txTransferReq.arg0),
          BigNumber.from(txTransferReq.tokenId),
          BigNumber.from(txTransferReq.amount),
          BigNumber.from(txTransferReq.arg1),
        ]
      ).replaceAll('0x', '');
      return {
        r_chunks: Buffer.concat([Buffer.from(out_r, 'hex')], MAX_CHUNKS_BYTES_PER_REQ),
        o_chunks: Buffer.concat([Buffer.from(out_r, 'hex')], 4 * CHUNK_BYTES_SIZE),
        isCritical: true,
      };
    case TsTxType.DEPOSIT:
      if(!txTransferReq.arg0) {
        throw new Error('arg0 is required');
      }
      const out_d = ethers.utils.solidityPack(
        ['uint8', 'uint32', 'uint16', 'uint128',],
        [
          BigNumber.from(txTransferReq.reqType),
          BigNumber.from(txTransferReq.arg0),
          BigNumber.from(txTransferReq.tokenId),
          BigNumber.from(txTransferReq.amount),
        ]
      ).replaceAll('0x', '');
      return {
        r_chunks: Buffer.concat([Buffer.from(out_d, 'hex')], MAX_CHUNKS_BYTES_PER_REQ),
        o_chunks: Buffer.concat([Buffer.from(out_d, 'hex')], 2 * CHUNK_BYTES_SIZE),
        isCritical: true,
      };
    case TsTxType.WITHDRAW:
      const out_w = ethers.utils.solidityPack(
        ['uint8', 'uint32', 'uint16', 'uint128',],
        [
          BigNumber.from(txTransferReq.reqType),
          BigNumber.from(txTransferReq.accountId),
          BigNumber.from(txTransferReq.tokenId),
          BigNumber.from(txTransferReq.amount),
        ]
      ).replaceAll('0x', '');
      return {
        r_chunks: Buffer.concat([Buffer.from(out_w, 'hex')], MAX_CHUNKS_BYTES_PER_REQ),
        o_chunks: Buffer.concat([Buffer.from(out_w, 'hex')], 2 * CHUNK_BYTES_SIZE),
        isCritical: true,
      };
    case TsTxType.SecondLimitOrder:
      const out_slo = ethers.utils.solidityPack(
        ['uint8', 'uint32', 'uint16', 'uint40',],
        [
          BigNumber.from(txTransferReq.reqType),
          BigNumber.from(txTransferReq.accountId),
          BigNumber.from(txTransferReq.tokenId),
          BigNumber.from(amountToTxAmountV3_40bit(txTransferReq.amount)),
        ]
      ).replaceAll('0x', '');
      return {
        r_chunks: Buffer.concat([Buffer.from(out_slo, 'hex')], MAX_CHUNKS_BYTES_PER_REQ),
        o_chunks: Buffer.concat([Buffer.from(out_slo, 'hex')], 1 * CHUNK_BYTES_SIZE),
        isCritical: false,
      };
    case TsTxType.CancelOrder:
      const out_co = ethers.utils.solidityPack(
        ['uint8', 'uint32', 'uint16', 'uint40',],
        [
          BigNumber.from(txTransferReq.reqType),
          BigNumber.from(txTransferReq.arg0),
          BigNumber.from(txTransferReq.tokenId),
          BigNumber.from(amountToTxAmountV3_40bit(txTransferReq.amount)),
        ]
      ).replaceAll('0x', '');
      return {
        r_chunks: Buffer.concat([Buffer.from(out_co, 'hex')], MAX_CHUNKS_BYTES_PER_REQ),
        o_chunks: Buffer.concat([Buffer.from(out_co, 'hex')], 1 * CHUNK_BYTES_SIZE),
        isCritical: false,
      };
    case TsTxType.SecondLimitStart:
      if(!metadata?.txOffset) {
        throw new Error('txOffset is required');
      }
      const out_sls = ethers.utils.solidityPack(
        ['uint8', 'uint32'],
        [
          BigNumber.from(txTransferReq.reqType),
          BigNumber.from(metadata?.txOffset),
        ]
      ).replaceAll('0x', '');
      return {
        r_chunks: Buffer.concat([Buffer.from(out_sls, 'hex')], MAX_CHUNKS_BYTES_PER_REQ),
        o_chunks: Buffer.concat([Buffer.from(out_sls, 'hex')], 1 * CHUNK_BYTES_SIZE),
        isCritical: false,
      };
    case TsTxType.SecondLimitExchange:
      if(!metadata?.txOffset) {
        throw new Error('txOffset is required');
      }
      if(!metadata?.buyAmt) {
        throw new Error('buyAmt is required');
      }
      const out_sle = ethers.utils.solidityPack(
        ['uint8', 'uint32', 'uint40'],
        [
          BigNumber.from(txTransferReq.reqType),
          BigNumber.from(metadata?.txOffset),
          BigNumber.from(amountToTxAmountV3_40bit(metadata?.buyAmt)),
        ]
      ).replaceAll('0x', '');
      return {
        r_chunks: Buffer.concat([Buffer.from(out_sle, 'hex')], MAX_CHUNKS_BYTES_PER_REQ),
        o_chunks: Buffer.concat([Buffer.from(out_sle, 'hex')], 1 * CHUNK_BYTES_SIZE),
        isCritical: false,
      };
    case TsTxType.SecondLimitEnd:
      const out_slend = ethers.utils.solidityPack(
        ['uint8'],
        [
          BigNumber.from(txTransferReq.reqType),
        ]
      ).replaceAll('0x', '');
      return {
        r_chunks: Buffer.concat([Buffer.from(out_slend, 'hex')], MAX_CHUNKS_BYTES_PER_REQ),
        o_chunks: Buffer.concat([Buffer.from(out_slend, 'hex')], 1 * CHUNK_BYTES_SIZE),
        isCritical: false,
      };
    case TsTxType.NOOP:      
    case TsTxType.UNKNOWN:
      return {
        r_chunks: Buffer.alloc(MAX_CHUNKS_BYTES_PER_REQ),
        o_chunks: Buffer.concat([Buffer.from('00', 'hex')], 1 * CHUNK_BYTES_SIZE),
        isCritical: false,
      };
    default:
      throw new Error('unknown reqType');
  }
  
}

function padHexByBytes(hex: string, bytes: number): string {
  // hex = hex.slice(2);
  if(hex.length % 2 !== 0) throw new Error('hex should be even length');
  if(hex.length / 2 > bytes) throw new Error('hex should be less than bytes');
  const padding = '0'.repeat(bytes * 2 - hex.length);
  return padding + hex;
}

export function toHexString(value: string | bigint | number | Buffer | Uint8Array) {
  if(typeof value === 'string') {
    if(/^0x/.test(value)) return value;
    return BigInt(value).toString(16);
  }
  if(typeof value === 'number') {
    return value.toString(16);
  }
  if(typeof value === 'bigint') {
    return value.toString(16);
  }
  if(value instanceof Buffer) {
    return value.toString('hex');
  }
  if(value instanceof Uint8Array) {
    return Buffer.from(value).toString('hex');
  }
  throw new Error('value should be string, number, bigint, Buffer or Uint8Array');
}

export function padAndToBuffer(value: string, bytes: number): Buffer {
  const hexString = toHexString(value);
  const buffer = Buffer.from(/^0x/.test(hexString) ? hexString.slice(2) : hexString, 'hex');
  return Buffer.concat([buffer], bytes);
}

export function toBigIntChunkArray(data: Buffer, chunkBytesSize: number): bigint[] {
  const result: bigint[] = [];
  const uint8arr = new Uint8Array(data);
  for (let i = 0; i < uint8arr.length; i += chunkBytesSize) {
    const chunk = uint8arr.slice(i, i + chunkBytesSize);
    result.push(BigInt('0x' + Buffer.from(chunk).toString('hex')));
  }
  return result;
}

export function bigint_to_chunk_arrayV2(x: Buffer, chunkBytes: number): bigint[] {
  const ret: bigint[] = [];
  for(let i = x.length - 1; i >= 0; i -= chunkBytes) {
    let val = 0n;
    for (let offset = 0; offset < chunkBytes; offset++) {
      const element = x[i - offset];
      val += BigInt(element) << BigInt(offset * 8);
    }
    ret.push(val);
  }
  return ret;
}
export function bigint_to_chunk_array(x: bigint, chunkBits: bigint): bigint[] {
  const mod = 2n ** BigInt(chunkBits);

  const ret: bigint[] = [];
  let x_temp: bigint = x;
  while(x_temp > 0n) {
    ret.push(x_temp % mod);
    x_temp = x_temp >> chunkBits;
  }
  return ret.reverse();
}
// 12345 6789abcdef
// => [6789abcdef, 12345]