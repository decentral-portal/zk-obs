import { EddsaSigner } from '../eddsa';
import { TsMerkleTree } from '../merkle-tree-dp';
import { dpPoseidonHash } from '../poseidon-hash-dp';
import { EdDSASignaturePayload } from '../ts-types/eddsa-types';
import { TsTxWithdrawRequest, TsTxWithdrawNonSignatureRequest, TsTxTransferRequest, TsTxDepositRequest, TsTxDepositNonSignatureRequest, TsTxAuctionLendNonSignatureRequest, TsTxAuctionBorrowNonSignatureRequest, TsTxAuctionBorrowRequest, TsTxAuctionLendRequest, TsTxAuctionCancelNonSignatureRequest, TsTxAuctionCancelRequest } from '../ts-types/ts-req-types';
import { TsTokenInfo, TsTokenAddress, TsSystemAccountAddress, TsTxType } from '../ts-types/ts-types';
import { toTreeLeaf, tsHashFunc } from './ts-helper';
import { encodeTxDepositMessage, encodeTxTransferMessage, encodeTxAuctionLendMessage, encodeTxAuctionBorrowMessage, encodeTxWithdrawMessage, encodeTxAuctionCancelMessage } from './ts-tx-helper';
import { RESERVED_ACCOUNTS } from './ts-env';
import assert from 'assert';

export class TsRollupAccount {
  accountId = -1n;

  
  private eddsaPubKey: [bigint, bigint];
  get tsPubKey(): [bigint, bigint] {
    return this.eddsaPubKey;
  }
  nonce: bigint;
  tokenLeafs: TsTokenInfo[];
  tokenTree: TsMerkleTree;
  
  tokenTreeSize: number;
  get isNormalAccount() {
    return TsRollupAccount.checkIsNormalAccount(this.accountId);
  }
  static checkIsNormalAccount(l2Addr: bigint) {
    return l2Addr >= RESERVED_ACCOUNTS;
  }


  constructor(
    tokenLeafs : TsTokenInfo[],
    tokenTreeSize: number,
    eddsaPubKey: [bigint, bigint],
    nonce = 0n,
  ) {
    this.tokenTreeSize = tokenTreeSize;
    const defaultTokenLeaf = toTreeLeaf([0n, 0n, 0n]);
    this.nonce = nonce;
    this.tokenLeafs = tokenLeafs;
    this.eddsaPubKey = eddsaPubKey;
   
    this.tokenTree = new TsMerkleTree(
      this.encodeTokenLeafs(),
      this.tokenTreeSize, tsHashFunc,
      defaultTokenLeaf
    );

  }

  setAccountAddress(l2Addr: bigint) {
    this.accountId = l2Addr;
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

  encodeTokenLeaf(tokenAddr: TsTokenAddress) {
    const idx = this.tokenLeafs.findIndex(t => t.tokenAddr === tokenAddr);
    if(idx === -1) {
      throw new Error('Token not found');
    }
    const t = this.tokenLeafs[idx];
    return toTreeLeaf([BigInt(t.tokenAddr), BigInt(t.amount), BigInt(t.lockAmt)]);
  }
  encodeTokenLeafs() {
    return this
      .tokenLeafs
      .map(t => toTreeLeaf([
        BigInt(t.tokenAddr),
        BigInt(t.amount),
        BigInt(t.lockAmt)
      ]));
  }

  getTokenRoot() {
    return this.tokenTree.getRoot();
  }

  getTokenLeaf(tokenAddr: TsTokenAddress): {leafId: number, leaf: TsTokenInfo} {
    if(!this.isNormalAccount) {
      return {
        leafId: 0,
        leaf: {
          tokenAddr: TsTokenAddress.Unknown,
          amount: 0n,
          lockAmt: 0n,
        }
      };
    }
    const idx = this.tokenLeafs.findIndex(t => t.tokenAddr === tokenAddr);
    if(idx === -1) {
      return {
        // If token not found, return curernt new token slot id
        leafId: this.tokenLeafs.length,
        leaf: {
          tokenAddr: TsTokenAddress.Unknown,
          amount: 0n,
          lockAmt: 0n,
        }
      };
    }
    return {
      leafId: idx,
      leaf: this.tokenLeafs[idx],
    };
    
  }

  getTokenLeafId(tokenAddr: TsTokenAddress) {
    return this.getTokenLeaf(tokenAddr).leafId;
  }

  getTokenProof(tokenAddr: TsTokenAddress) {
    const { leafId } = this.getTokenLeaf(tokenAddr);
    return this.tokenTree.getProof(leafId);
  }
  
  updateTokenNew(tokenAddr: TsTokenAddress, addAmt: bigint, addLockAmt: bigint) {
    if(!this.isNormalAccount) {
      return this.tokenTree.getRoot();
    }
    let idx = this.tokenLeafs.findIndex(t => t.tokenAddr === tokenAddr);
    if(idx === -1) {
      this.tokenLeafs.push({
        tokenAddr,
        amount: 0n,
        lockAmt: 0n,
      });
      idx = this.tokenLeafs.length - 1;
    }
    const newAmt = this.tokenLeafs[idx].amount + addAmt;
    assert(newAmt >= 0n, 'new token amount must >= 0');
    const newLockAmt = this.tokenLeafs[idx].lockAmt + addLockAmt;
    assert(newLockAmt >= 0n, 'new token lock amount must >= 0');
    this.tokenLeafs[idx].amount = newAmt;
    this.tokenLeafs[idx].lockAmt = newLockAmt;
    this.tokenTree.updateLeafNode(idx, this.encodeTokenLeaf(tokenAddr));
    return this.tokenTree.getRoot();
  }

  updateToken(tokenAddr: TsTokenAddress, addAmt: bigint, isAuctionOrder = false) {
    if(!this.isNormalAccount) {
      return this.tokenTree.getRoot();
    }
    const idx = this.tokenLeafs.findIndex(t => t.tokenAddr === tokenAddr);
    if(idx === -1) {
      if(addAmt < 0n) {
        throw new Error('Token insufficient');
      }
      this.tokenLeafs.push({tokenAddr, amount: addAmt, lockAmt: 0n});
      this.tokenTree.updateLeafNode(this.tokenLeafs.length - 1, this.encodeTokenLeaf(tokenAddr));
    } else {
      
      this.tokenLeafs[idx].amount += addAmt;
      if(this.tokenLeafs[idx].amount < 0) {
        throw new Error('Token insufficient');
      }
      if(isAuctionOrder) {
        this.tokenLeafs[idx].lockAmt -= addAmt;
      }
      if(this.tokenLeafs[idx].amount < 0 || this.tokenLeafs[idx].lockAmt < 0) {
        throw new Error(`Token insufficient: tokenAddr=${tokenAddr} amount=${this.tokenLeafs[idx].amount} ,lockAmt=${this.tokenLeafs[idx].lockAmt}`);
      }
      this.tokenTree.updateLeafNode(idx, this.encodeTokenLeaf(tokenAddr));
    }

    return this.tokenTree.getRoot();
  }


  getTokenAmount(tokenAddr: TsTokenAddress) {
    if(!this.isNormalAccount) {
      return 0n;
    }
    for (let i = 0; i < this.tokenLeafs.length; i++) {
      if (this.tokenLeafs[i].tokenAddr === tokenAddr) {
        return this.tokenLeafs[i].amount;
      }
    }
    return 0n;
  }

  getTokenLockedAmount(tokenAddr: TsTokenAddress) {
    if(!this.isNormalAccount) {
      return 0n;
    }
    for (let i = 0; i < this.tokenLeafs.length; i++) {
      if (this.tokenLeafs[i].tokenAddr === tokenAddr) {
        return this.tokenLeafs[i].lockAmt;
      }
    }
    return 0n;
  }

  encodeAccountLeaf(): [bigint, bigint, bigint, bigint]{
    const pub = this.tsPubKey;
    return [
      pub[0], pub[1],
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

  prepareTxWithdraw(nonce: bigint, accountId: bigint, tokenAddr: TsTokenAddress, amount: bigint): TsTxWithdrawRequest {
    const req: TsTxWithdrawNonSignatureRequest = {
      reqType: TsTxType.WITHDRAW,
      L2AddrFrom: accountId.toString(),
      L2AddrTo: TsSystemAccountAddress.WITHDRAW_ADDR,
      L2TokenAddr: tokenAddr,
      amount: amount.toString(),
      nonce: nonce.toString(),
    };
    const msgHash = dpPoseidonHash(encodeTxWithdrawMessage(req));
    const eddsaSig = this.signPoseidonMessageHash(msgHash);
    return {
      ...req,
      eddsaSig: {
        S: eddsaSig.S.toString(),
        R8: [
          EddsaSigner.toObject(eddsaSig.R8[0]).toString(),
          EddsaSigner.toObject(eddsaSig.R8[1]).toString(),
        ]
      },
    };
  }

  prepareTxTransfer(nonce: bigint | number, fromAddr: bigint, toAddr: bigint, tokenAddr: TsTokenAddress, amount: bigint): TsTxTransferRequest {
    const req = {
      reqType: TsTxType.TRANSFER,
      L2AddrFrom: fromAddr.toString(),
      L2AddrTo: toAddr.toString(),
      L2TokenAddr: tokenAddr,
      amount: amount.toString(),
      nonce: nonce.toString(),
    };
    const msgHash = dpPoseidonHash(encodeTxTransferMessage(req));
    const eddsaSig = this.signPoseidonMessageHash(msgHash);

    return {
      ...req,
      eddsaSig: {
        S: eddsaSig.S.toString(),
        R8: [
          EddsaSigner.toObject(eddsaSig.R8[0]).toString(),
          EddsaSigner.toObject(eddsaSig.R8[1]).toString(),
        ]
      },
    };
  }

  prepareTxDeposit(toAddr: bigint, tokenAddr: TsTokenAddress, amount: bigint): TsTxDepositRequest {
    const req: TsTxDepositNonSignatureRequest = {
      reqType: TsTxType.DEPOSIT,
      L2AddrFrom: TsSystemAccountAddress.MINT_ADDR,
      L2AddrTo: toAddr.toString(),
      L2TokenAddr: tokenAddr,
      amount: amount.toString(),
      nonce: '0',
    };
    const msgHash = dpPoseidonHash(encodeTxDepositMessage(req));
    const eddsaSig = this.signPoseidonMessageHash(msgHash);

    return {
      ...req,
      eddsaSig: {
        S: eddsaSig.S.toString(),
        R8: [
          EddsaSigner.toObject(eddsaSig.R8[0]).toString(),
          EddsaSigner.toObject(eddsaSig.R8[1]).toString(),
        ]
      },
    };
  }

  prepareTxAuctionPlaceLend(data: Exclude<TsTxAuctionLendNonSignatureRequest, 'L2AddrTo'>): TsTxAuctionLendRequest {
    const req: TsTxAuctionLendNonSignatureRequest = {
      ...data,
      L2AddrTo: TsSystemAccountAddress.AUCTION_ADDR
    };
    const msgHash = dpPoseidonHash(encodeTxAuctionLendMessage(req));
    const eddsaSig = this.signPoseidonMessageHash(msgHash);

    return {
      ...req,
      eddsaSig: {
        S: eddsaSig.S.toString(),
        R8: [
          EddsaSigner.toObject(eddsaSig.R8[0]).toString(),
          EddsaSigner.toObject(eddsaSig.R8[1]).toString(),
        ]
      },
    };
  }

  prepareTxAuctionPlaceBorrow(data: Exclude<TsTxAuctionBorrowNonSignatureRequest,  'L2AddrTo'>): TsTxAuctionBorrowRequest {
    const req: TsTxAuctionBorrowNonSignatureRequest = {
      ...data,
      L2AddrTo: TsSystemAccountAddress.AUCTION_ADDR
    };
    const msgHash = dpPoseidonHash(encodeTxAuctionBorrowMessage(req));
    const eddsaSig = this.signPoseidonMessageHash(msgHash);

    return {
      ...req,
      eddsaSig: {
        S: eddsaSig.S.toString(),
        R8: [
          EddsaSigner.toObject(eddsaSig.R8[0]).toString(),
          EddsaSigner.toObject(eddsaSig.R8[1]).toString(),
        ]
      },
    };
  }

  prepareTxAuctionCancel(data: Exclude<TsTxAuctionCancelNonSignatureRequest,  'L2AddrFrom'>): TsTxAuctionCancelRequest {
    const req: TsTxAuctionCancelNonSignatureRequest = {
      ...data,
      L2AddrFrom: TsSystemAccountAddress.AUCTION_ADDR
    };
    const msgHash = dpPoseidonHash(encodeTxAuctionCancelMessage(req));
    const eddsaSig = this.signPoseidonMessageHash(msgHash);

    return {
      ...req,
      eddsaSig: {
        S: eddsaSig.S.toString(),
        R8: [
          EddsaSigner.toObject(eddsaSig.R8[0]).toString(),
          EddsaSigner.toObject(eddsaSig.R8[1]).toString(),
        ]
      },
    };
  }
}