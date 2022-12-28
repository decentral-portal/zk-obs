import { TsMerkleTree } from '../merkle-tree-dp';
import { dpPoseidonHash } from '../poseidon-hash-dp';
import { TsRollupRegisterType } from '../ts-types/ts-circuit-types';
import { EdDSASignatureRequestType } from '../ts-types/ts-req-types';
import { TsTxType, TsTokenAddress } from '../ts-types/ts-types';
import { TsRollupAccount } from './ts-account';
import { TX_REQDATAS_SIZE } from './ts-env';
import { txTypeToDataLength } from './ts-helper';
import { TsTxRequestDatasType } from './ts-tx-helper';

export interface TsRollupTxInterface {
    txType: TsTxType;
    // reqDatas: [bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint];
    // encodePoseidonMessageHash(nounce: bigint): bigint;
}
export class RollupTxRegister implements TsRollupTxInterface {
  txType = TsTxType.REGISTER;
  TX_DATASIZE = txTypeToDataLength(TsTxType.REGISTER);
  tsPubKey: [bigint, bigint];
  l2Addr: bigint;
  L2TokenAddr: TsTokenAddress;
  tokenAmt: bigint;

  constructor(
    _l2Addr: bigint,
    _tsPubKey: [bigint, bigint],
    _tokenAddr: TsTokenAddress,
    _amount: bigint,
  ) {
    this.l2Addr = _l2Addr;
    this.tsPubKey = _tsPubKey;
    this.L2TokenAddr = _tokenAddr;
    this.tokenAmt = _amount;
  }

  encodeCircuitInputData(): TsRollupRegisterType {
    return {
      L2Addr: this.l2Addr.toString(),
      tsPubKey: [this.tsPubKey[0].toString(), this.tsPubKey[1].toString()],
      L2TokenAddr: this.L2TokenAddr.toString(),
      amount: this.tokenAmt.toString(),
    };
  }

}

export class RollupTxTransfer implements TsRollupTxInterface {
  public txType: TsTxType;

  public txTokenIdFrom: bigint;
  public txTokenIdTo: bigint;
    
  public txL2TokenAddr: TsTokenAddress;
  public txAmount: bigint;
  public txL2AddrFrom: bigint;
  public txL2AddrTo: bigint;
  public txNonce: bigint;

  // TODO: need Nonce ?
  // public txNounce: bigint;

  public fromAccount: TsRollupAccount;
  public toAccount: TsRollupAccount;

  // public reqSigMsg: EdDSASignaturePayload | null = null;
  public reqSigS = 0n;
  public reqSigR8: [bigint, bigint] = [0n, 0n];
  public args: bigint[];

  constructor(
    _txType: TsTxType,
    fromAccount: TsRollupAccount,
    toAccount: TsRollupAccount,
    txL2TokenAddr : TsTokenAddress,
    txAmount : bigint,
    txNonce: bigint,
    args: string[],
    _sig: EdDSASignatureRequestType,
  ) {
    this.txType = _txType;
    this.fromAccount = fromAccount;
    this.toAccount = toAccount;
    this.txTokenIdFrom = BigInt(fromAccount.getTokenLeafId(txL2TokenAddr));
    this.txTokenIdTo = BigInt(toAccount.getTokenLeafId(txL2TokenAddr));

    this.txL2TokenAddr = txL2TokenAddr;
    this.txAmount = txAmount;
    this.txL2AddrFrom = fromAccount.L2Address;
    this.txL2AddrTo = toAccount.L2Address;
    // TODO: Validaion Tx nonce in here ?
    // const newNonce = this.fromAccount.isNormalAccount ? this.fromAccount.nonce + 1n : 0n;
    // assert(txNonce >= newNonce, `Tx nonce should be larger than account nonce. L2Addr=${fromAccount.L2Address}, txNonce=${txNonce}, correctNonce=${newNonce}`);
    this.txNonce = txNonce;

    this.reqSigS = BigInt(_sig.S);
    this.reqSigR8 = [BigInt(_sig.R8[0]), BigInt(_sig.R8[1])];

    this.args = args.map(t => BigInt(t));
    if(args.length > TX_REQDATAS_SIZE) {
      throw new Error(`args length should be less than ${TX_REQDATAS_SIZE}`);
    }
  }

  encodeReqDatas(): TsTxRequestDatasType {
    const reqDatas = [
      BigInt(this.txType),
      this.txL2AddrFrom,
      this.txL2AddrTo,
      BigInt(this.txL2TokenAddr),
      this.txAmount,
      this.txNonce,
      ...this.args,
    ];
    while(reqDatas.length < TX_REQDATAS_SIZE) {
      reqDatas.push(0n);
    }
    return reqDatas as TsTxRequestDatasType;
  }

  encodeCircuitInputData(isAuction: boolean) {
    // TODO: nonce should be from Request?
    const oriNonceFrom = this.fromAccount.nonce;
    const newNonceFrom = this.fromAccount.isNormalAccount ? this.txNonce + 1n : 0n;
        
    const reqDatas = this.encodeReqDatas();
    const reqSigMsg = dpPoseidonHash(reqDatas);
    // TODO: validate signature
    // const isValidSig = EddsaSigner.verify(
    //   EddsaSigner.toE(reqSigMsg),
    //   {
    //     R8: [EddsaSigner.toE(this.reqSigR8[0]), EddsaSigner.toE(this.reqSigR8[1])],
    //     S: this.reqSigS,
    //   },
    //   [EddsaSigner.toE(this.fromAccount.tsPubKey[0]), EddsaSigner.toE(this.fromAccount.tsPubKey[1])],
    // );
    // assert(isValidSig, 'Invalid signature');

    const fromTokenInfo = this.fromAccount.getTokenLeaf(this.txL2TokenAddr);
    const toTokenInfo = this.toAccount.getTokenLeaf(this.txL2TokenAddr);
    const datas = {
      // reqType: this.txType,
      reqDatas,
      reqSigMsg,
      reqSigS: this.reqSigS,
      reqSigR8: this.reqSigR8,

      tokenLeafIdFrom: fromTokenInfo.leafId,
      tokenLeafIdTo: toTokenInfo.leafId,
      txL2TokenAddr: this.txL2TokenAddr,
      txAmount: this.txAmount,
      txL2AddrFrom: this.txL2AddrFrom,
      txL2AddrTo: this.txL2AddrTo,
            
      tsPubKeyFrom: this.fromAccount.tsPubKey,
      txNonce: this.txNonce,
      oriNonceFrom,
      newNonceFrom,

      oriL2TokenAddrFrom: fromTokenInfo.leaf.tokenAddr,
      newL2TokenAddrFrom: fromTokenInfo.leaf.tokenAddr,
      oriAmountFrom: fromTokenInfo.leaf.amount,
      newAmountFrom: this.fromAccount.isNormalAccount ? fromTokenInfo.leaf.amount - this.txAmount : 0n,

      tsPubKeyTo: this.toAccount.tsPubKey,
      oriNonceTo: this.toAccount.nonce,
      newNonceTo: this.toAccount.nonce,

      oriAmountTo: toTokenInfo.leaf.amount,
      newAmountTo: this.toAccount.isNormalAccount ? toTokenInfo.leaf.amount + this.txAmount : 0n,

      // TODO: Question: need oriL2TokenAddrTo, newL2TokenAddrTo,
      oriL2TokenAddrTo: toTokenInfo.leaf.tokenAddr,
      // TODO: handle new TokenAddrTo
      newL2TokenAddrTo: this.toAccount.isNormalAccount ? this.txL2TokenAddr : 0n,

      oriLockedAmountFrom: fromTokenInfo.leaf.lockAmt,
      oriLockedAmountTo: toTokenInfo.leaf.lockAmt,
      newLockedAmountFrom: 
        this.fromAccount.isNormalAccount
          ? ((isAuction && this.txType !== TsTxType.AUCTION_CANCEL)
            ? this.fromAccount.getTokenLockedAmount(this.txL2TokenAddr) + this.txAmount
            : this.fromAccount.getTokenLockedAmount(this.txL2TokenAddr))
          : 0n,
      newLockedAmountTo: 
        this.toAccount.isNormalAccount 
          ? (this.txType === TsTxType.AUCTION_CANCEL
            ? this.toAccount.getTokenLockedAmount(this.txL2TokenAddr) - this.txAmount
            : this.toAccount.getTokenLockedAmount(this.txL2TokenAddr))
          : 0n,
    };

    return datas;
  }

}

interface TsAuctionLenderOrderLeaf {
    orderId: bigint;
    L2Addr: bigint;
    L2TokenAddrLending: bigint;
    maturityDate: bigint;
    interest: bigint;
    lendingAmt: bigint;
    expiredTime: number;
}
interface TsAuctionBorrowerOrderLeaf {
    orderId: bigint;
    L2Addr: bigint;
    L2TokenAddrLending: bigint;
    maturityDate: bigint;
    interest: bigint;
    lendingAmt: bigint;
    L2TokenAddrCollateral: bigint;
    collateralAmt: bigint;
    expiredTime: number;
}


export class TsAuctionMarket {
  lenderOrderTree!: TsMerkleTree;
  lenderOrderLeafs: TsAuctionLenderOrderLeaf[] = [];
  borrowerOrderLeafs: TsAuctionBorrowerOrderLeaf[] = [];

}