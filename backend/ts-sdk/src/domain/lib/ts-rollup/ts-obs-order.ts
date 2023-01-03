import { EdDSASignatureRequestType, } from '../ts-types/ts-req-types';
import { TsSystemAccountAddress, TsTokenAddress, TsTxType } from '../ts-types/ts-types';
import { toTreeLeaf } from './ts-helper';
type ObsOrderEncodeInfoType = [
  bigint, bigint,
  bigint, bigint,
  bigint, bigint,
  bigint, bigint,
  bigint, bigint,
  bigint, bigint, bigint,
]
export class NullifierEmptyItem {
  public arg0 = 0n;
  public arg1 = 0n;
  public arg2 = 0n;
  public arg3 = 0n;
  public arg4 = 0n;
  public arg5 = 0n;
  public arg6 = 0n;
  public arg7 = 0n;

  encode() {
    return [
      this.arg0,
      this.arg1,
      this.arg2,
      this.arg3,
      this.arg4,
      this.arg5,
      this.arg6,
      this.arg7,
    ];
  }

  public encodeHash(): string {
    return toTreeLeaf(this.encode());
  }

}

export interface ITsAuctionOrder {
  orderId: number;
  txId: bigint;
  reqType: TsTxType.AUCTION_LEND | TsTxType.AUCTION_BORROW | TsTxType.UNKNOWN;
  L2AddrFrom: bigint;
  // L2AddrTo: TsSystemAccountAddress.AUCTION_ADDR;
  L2TokenAddrLending: TsTokenAddress;
  L2TokenAddrTSL: TsTokenAddress;
  interest: bigint;
  lendingAmt: bigint;
  L2TokenAddrCollateral: TsTokenAddress;
  collateralAmt: bigint;
  expiredTime: Date;
  nonce: bigint;
  eddsaSig: EdDSASignatureRequestType;
  timestamp: number;
  maturityDate: string;
  encode(): ObsOrderEncodeInfoType;
  encodeOrderLeaf(): string;  
}

export class TsAuctionEmptyOrder implements ITsAuctionOrder {
  txId = 0n;
  orderId = 0;
  reqType: TsTxType.AUCTION_LEND | TsTxType.AUCTION_BORROW = TsTxType.UNKNOWN as any;
  L2AddrFrom = BigInt(TsSystemAccountAddress.MINT_ADDR);
  L2TokenAddrLending: TsTokenAddress = TsTokenAddress.Unknown;
  L2TokenAddrTSL = TsTokenAddress.Unknown;
  interest = 0n;
  lendingAmt = 0n;
  L2TokenAddrCollateral: TsTokenAddress = TsTokenAddress.Unknown;
  collateralAmt = 0n;
  expiredTime: Date = new Date(0);
  nonce = 0n;
  eddsaSig: EdDSASignatureRequestType = {
    R8: ['0', '0'],
    S: '0',
  };
  timestamp = 0;
  maturityDate = '';
  encode() {
    return [
      BigInt(TsTxType.UNKNOWN),
      BigInt(this.L2AddrFrom),
      BigInt(this.L2TokenAddrCollateral),
      this.collateralAmt, // amount
      this.nonce, // nonce
      0n, // maturityDate
      0n, // expiredTime
      this.interest, // interest
      BigInt(this.L2TokenAddrLending), // L2TokenAddrBorrowing
      this.lendingAmt, // borrowingAmt
      this.txId,
      0n, 0n,
    ] as ObsOrderEncodeInfoType;
  }
  public encodeOrderLeaf(): string {
    return toTreeLeaf(this.encode());
  }
}

