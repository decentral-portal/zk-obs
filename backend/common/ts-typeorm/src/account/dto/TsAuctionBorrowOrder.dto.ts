import { toTreeLeaf } from '../../common/ts-helper';
import { ITsAuctionOrder } from './ITsAuctionOrder.interface';
import { EdDSASignatureRequestType, maturityToTsl, TsTxAuctionBorrowRequest } from './ts-req-types';
import { encodeTxAuctionBorrowMessage } from './ts-tx-helper';
import { TsTxType, TsSystemAccountAddress, TsTokenAddress } from './ts-type';

export class TsAuctionBorrowOrder implements ITsAuctionOrder {
  orderId!: number;
  txId: bigint;
  reqType: TsTxType.AUCTION_BORROW = TsTxType.AUCTION_BORROW;
  L2AddrFrom: bigint;
  L2AddrTo: TsSystemAccountAddress.AUCTION_ADDR = TsSystemAccountAddress.AUCTION_ADDR;
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
  private _req: TsTxAuctionBorrowRequest;
  
  constructor(orderId: number, txId: bigint, req: TsTxAuctionBorrowRequest, timestamp: number) {
    this.orderId = orderId;
    this.L2AddrFrom = BigInt(req.L2AddrFrom);
    this.L2TokenAddrLending = req.L2TokenAddrBorrowing;
    this.lendingAmt = BigInt(req.borrowingAmt);
    this.nonce = BigInt(req.nonce);
    this.L2TokenAddrTSL = maturityToTsl(req.L2TokenAddrBorrowing, req.maturityDate);
    this.interest = BigInt(req.interest);
    this.maturityDate = req.maturityDate;

    this.L2TokenAddrCollateral = req.L2TokenAddrCollateral;
    this.collateralAmt = BigInt(req.collateralAmt);

    this.expiredTime = new Date(Number(req.expiredTime));
    this.eddsaSig = req.eddsaSig;

    this._req = req;
    this.timestamp = timestamp;
    this.txId = txId;
  }
  encode(): bigint[] {
    return encodeTxAuctionBorrowMessage(this._req);
  }
  encodeOrderLeaf(): string {
    const borrowLeaf = toTreeLeaf([...this.encode(), BigInt(this.txId)]);
    return borrowLeaf;
  }
}

