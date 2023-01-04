import { TsRollupRegisterType } from '../ts-types/ts-circuit-types';
import { TsTxType, TsTokenAddress } from '../ts-types/ts-types';

export interface TsRollupTxInterface {
    txType: TsTxType;
    // reqDatas: [bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint];
    // encodePoseidonMessageHash(nounce: bigint): bigint;
}
export class RollupTxRegister implements TsRollupTxInterface {
  txType = TsTxType.REGISTER;
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

