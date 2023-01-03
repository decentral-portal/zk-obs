import assert from 'assert';
import { EddsaSigner } from '../eddsa';
import { TsMerkleTree } from '../merkle-tree-dp';
import { dpPoseidonHash } from '../poseidon-hash-dp';
import { EdDSASignaturePayload } from '../ts-types/eddsa-types';
import { TsTxWithdrawRequest, TsTxWithdrawNonSignatureRequest, TsTxDepositRequest, TsTxDepositNonSignatureRequest, TsTxLimitOrderRequest, TsTxLimitOrderNonSignatureRequest } from '../ts-types/ts-req-types';
import { TsTokenInfo, TsTokenAddress, TsSystemAccountAddress, TsTxType } from '../ts-types/ts-types';
import { toTreeLeaf, tsHashFunc } from './ts-helper';
import { encodeTsTxLimitOrderMessage, encodeTxDepositMessage, encodeTxWithdrawMessage } from './ts-tx-helper';
import { RESERVED_ACCOUNTS } from './ts-env';
import { TsAccountLeafType, TsTokenLeafType } from '../ts-types/ts-merkletree.types';

type TokenLeafInfoType = {
  [key in TsTokenAddress]?: TsTokenInfo;
}
export class TsRollupAccount {
  L2Address = -1n;

  
  private eddsaPubKey: [bigint, bigint];
  get tsPubKey(): [string, string] {
    return [this.eddsaPubKey[0].toString(), this.eddsaPubKey[1].toString()];
  }
  tsAddr!: bigint;
  nonce: bigint;
  tokenLeafs: TokenLeafInfoType;
  tokenTree: TsMerkleTree;
  
  tokenTreeSize: number;
  get isNormalAccount() {
    return TsRollupAccount.checkIsNormalAccount(this.L2Address);
  }
  static checkIsNormalAccount(l2Addr: bigint) {
    return l2Addr >= 2;
  }

  public get hashedTsPubKey() {
    const raw = BigInt(tsHashFunc(this.tsPubKey));
    const hash = raw % BigInt(2 ** 160);
    return hash;
    // return `0x${this.tsAddr.toString(16)}`;
  }

  constructor(
    tokenLeafs: TokenLeafInfoType,
    tokenTreeSize: number,
    _eddsaPubKey: [bigint, bigint],
    // eddsaPubKey: [bigint, bigint],
    nonce = 0n,
  ) {
    this.tokenTreeSize = tokenTreeSize;
    this.nonce = nonce;
    this.tokenLeafs = tokenLeafs;

    // this.tsAddr = tsAddr;
    this.eddsaPubKey = _eddsaPubKey;
   
    this.tokenTree = new TsMerkleTree(
      this.encodeTokenLeafs(),
      this.tokenTreeSize, tsHashFunc,
      this.encodeTokenLeaf({
        amount: 0n,
        lockAmt: 0n,
      })
    );

  }

  setAccountAddress(l2Addr: bigint) {
    this.L2Address = l2Addr;
  }
    
  updateNonce(newNonce: bigint) {
    if(this.isNormalAccount) {
      assert(newNonce > this.nonce, 'new nonce need larger than current nonce');
    } else {
      assert(newNonce === this.nonce, 'system account new nonce need equal to current nonce');
    }
    this.nonce = newNonce;
    return this.nonce;
  }

  encodeTokenLeaf(tokenInfo: TsTokenInfo) {
    if(!tokenInfo) {
      return toTreeLeaf([0n, 0n]);
    }
    return toTreeLeaf([BigInt(tokenInfo.amount), BigInt(tokenInfo.lockAmt)]);
  }
  encodeTokenLeafs() {
    const arr: TsTokenInfo[] = [];
    const total = 2 ** this.tokenTreeSize;
    for(let i = 0; i < total; i++) {      
      arr.push(this.getTokenLeaf(i.toString() as TsTokenAddress).leaf);
    }
    return arr.map(t => toTreeLeaf([
      t.amount,
      t.lockAmt
    ]));
  }

  getTokenRoot() {
    return this.tokenTree.getRoot();
  }

  getTokenLeaf(tokenAddr: TsTokenAddress): {leafId: bigint, leaf: TsTokenInfo} {
    const leafId = BigInt(tokenAddr);
    const tokenInfo = this.tokenLeafs[tokenAddr];

    if(tokenInfo) {
      return {
        leafId,
        leaf: tokenInfo
      };
    }
    return {
      leafId,
      leaf: {
        amount: 0n,
        lockAmt: 0n,
      }
    };
  }

  getTokenLeafId(tokenAddr: TsTokenAddress) {
    return BigInt(tokenAddr);
  }

  getTokenProof(tokenAddr: TsTokenAddress) {
    const leafId = this.getTokenLeafId(tokenAddr);
    return this.tokenTree.getProof(Number(leafId));
  }
  
  updateToken(tokenAddr: TsTokenAddress, addAmt: bigint, addLockAmt: bigint) {
    if(!this.isNormalAccount) {
      return this.tokenTree.getRoot();
    }
    const leafId = this.getTokenLeafId(tokenAddr);
    let tokenInfo!: TsTokenInfo;
    if(!!this.tokenLeafs[tokenAddr]) {
      const _tokenInfo = this.tokenLeafs[tokenAddr] as TsTokenInfo;
      tokenInfo = {
        amount: _tokenInfo.amount + addAmt,
        lockAmt: _tokenInfo.lockAmt + addLockAmt,
      };
      
    } else {
      tokenInfo = {
        amount: addAmt,
        lockAmt: addLockAmt,
      };
    }
    assert(tokenInfo.amount >= 0n, 'new token amount must >= 0');
    assert(tokenInfo.lockAmt >= 0n, 'new token lock amount must >= 0');
    this.tokenTree.updateLeafNode(Number(leafId), this.encodeTokenLeaf(tokenInfo));
    this.tokenLeafs[tokenAddr] = tokenInfo;
  }

  getTokenAmount(tokenAddr: TsTokenAddress) {
    return this.getTokenLeaf(tokenAddr).leaf.amount;
  }

  getTokenLockedAmount(tokenAddr: TsTokenAddress) {
    return this.getTokenLeaf(tokenAddr).leaf.lockAmt;
  }

  encodeAccountLeaf(): TsAccountLeafType {
    const pub = this.hashedTsPubKey;
    return [
      BigInt(pub),
      this.nonce,
      BigInt(this.getTokenRoot()),
    ];
  }

}

export class TsRollupSigner {
  private signer: EddsaSigner;
  get tsPubKey(): [bigint, bigint] {
    const pub = this.signer.publicKey.map(x => BigInt(EddsaSigner.toObject(x).toString()));
    return [
      pub[0], pub[1],
    ];
  }

  constructor(priv: Buffer, ) {
    this.signer = new EddsaSigner(priv);
  }

  public get hashedTsPubKey() {
    const raw = BigInt(tsHashFunc(this.tsPubKey.map(v => v.toString())));
    const hash = raw % BigInt(2 ** 160);
    return `0x${hash.toString(16).padStart(40, '0')}`;
  }

  signPoseidonMessageHash(msgHash: bigint) {
    return this.signer.signPoseidon(msgHash);
  }

  verifySignature(msgHash: bigint, signature: EdDSASignaturePayload) {
    const tsPubKey: [Uint8Array, Uint8Array] = [
      EddsaSigner.toE(this.tsPubKey[0]),
      EddsaSigner.toE(this.tsPubKey[1]),
    ];
    return EddsaSigner.verify(EddsaSigner.toE(msgHash), signature, tsPubKey);
  }

  prepareTxWithdraw(nonce: bigint, L2Address: bigint, tokenAddr: TsTokenAddress, amount: bigint): TsTxWithdrawRequest {
    const req: TsTxWithdrawNonSignatureRequest = {
      reqType: TsTxType.WITHDRAW,
      sender: L2Address.toString(),
      tokenId: tokenAddr,
      stateAmt: amount.toString(),
      nonce: nonce.toString(),
    };
    const msgHash = dpPoseidonHash(encodeTxWithdrawMessage(req));
    const eddsaSig = this.signPoseidonMessageHash(msgHash);
    return {
      ...req,
      eddsaSig: {
        R8: [
          EddsaSigner.toObject(eddsaSig.R8[0]).toString(),
          EddsaSigner.toObject(eddsaSig.R8[1]).toString(),
        ],
        S: eddsaSig.S.toString(),
      },
    };
  }

  prepareTxObsLimitOrder({
    sender,
    sellTokenId,
    sellAmt,
    nonce,
    buyTokenId,
    buyAmt,
  }: {
    sender: string,
    sellTokenId: TsTokenAddress,
    sellAmt: bigint,
    nonce: bigint,
    buyTokenId: TsTokenAddress,
    buyAmt: bigint,
  }): TsTxLimitOrderRequest {
    const req: TsTxLimitOrderNonSignatureRequest = {
      reqType: TsTxType.SecondLimitOrder,
      sender,
      sellTokenId,
      sellAmt: sellAmt.toString(),
      nonce: nonce.toString(),
      buyTokenId,
      buyAmt: buyAmt.toString(),
    };
    const msgHash = dpPoseidonHash(encodeTsTxLimitOrderMessage(req));
    const eddsaSig = this.signPoseidonMessageHash(msgHash);
    return {
      ...req,
      eddsaSig: {
        R8: [
          EddsaSigner.toObject(eddsaSig.R8[0]).toString(),
          EddsaSigner.toObject(eddsaSig.R8[1]).toString(),
        ],
        S: eddsaSig.S.toString(),
      },
    };
  }

  // prepareTxTransfer(nonce: bigint | number, fromAddr: bigint, toAddr: bigint, tokenAddr: TsTokenAddress, amount: bigint): TsTxTransferRequest {
  //   const req = {
  //     reqType: TsTxType.TRANSFER,
  //     L2AddrFrom: fromAddr.toString(),
  //     L2AddrTo: toAddr.toString(),
  //     L2TokenAddr: tokenAddr,
  //     amount: amount.toString(),
  //     nonce: nonce.toString(),
  //     txAmount: amountToTxAmountV2(amount).toString(),
  //   };
  //   const msgHash = dpPoseidonHash(encodeTxTransferMessage(req));
  //   const eddsaSig = this.signPoseidonMessageHash(msgHash);

  //   return {
  //     ...req,
  //     eddsaSig: {
  //       S: eddsaSig.S.toString(),
  //       R8: [
  //         EddsaSigner.toObject(eddsaSig.R8[0]).toString(),
  //         EddsaSigner.toObject(eddsaSig.R8[1]).toString(),
  //       ]
  //     },
  //   };
  // }

  prepareTxDeposit(toAddr: bigint, tokenAddr: TsTokenAddress, amount: bigint): TsTxDepositRequest {
    const req: TsTxDepositNonSignatureRequest = {
      reqType: TsTxType.DEPOSIT,
      sender: toAddr.toString(),
      tokenId: tokenAddr,
      stateAmt: amount.toString(),
    };

    return {
      ...req
    };
  }
}