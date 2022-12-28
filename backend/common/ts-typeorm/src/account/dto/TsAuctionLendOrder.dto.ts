import { toTreeLeaf } from '../../common/ts-helper';
import { ITsAuctionOrder } from './ITsAuctionOrder.interface';
import { EdDSASignatureRequestType, maturityToTsl, TsTxAuctionLendRequest } from './ts-req-types';
import { encodeTxAuctionLendMessage } from './ts-tx-helper';
import { TsTxType, TsSystemAccountAddress, TsTokenAddress } from './ts-type';

export class TsAuctionLendOrder implements ITsAuctionOrder {
  orderId!: number;
  txId: bigint;
  reqType: TsTxType.AUCTION_LEND = TsTxType.AUCTION_LEND;
  L2AddrFrom: bigint;
  L2AddrTo: TsSystemAccountAddress.AUCTION_ADDR = TsSystemAccountAddress.AUCTION_ADDR;
  L2TokenAddrLending: TsTokenAddress;
  L2TokenAddrTSL: TsTokenAddress;
  interest: bigint;
  lendingAmt: bigint;
  L2TokenAddrCollateral = TsTokenAddress.UNKNOWN;
  collateralAmt = 0n;
  expiredTime: Date;
  nonce: bigint;
  eddsaSig: EdDSASignatureRequestType;
  timestamp: number;
  maturityDate: string;
  private _req: TsTxAuctionLendRequest;
  
  constructor(orderId: number, txId: bigint, req: TsTxAuctionLendRequest, timestamp: number) {
    this.orderId = orderId;
    BigInt(this.reqType);
    this.L2AddrFrom = BigInt(req.L2AddrFrom);
    this.L2TokenAddrLending = req.L2TokenAddrLending;
    this.lendingAmt = BigInt(req.lendingAmt);
    this.nonce = BigInt(req.nonce);
    this.L2TokenAddrTSL = maturityToTsl(req.L2TokenAddrLending, req.maturityDate);
    this.interest = BigInt(req.interest);
    this.maturityDate = req.maturityDate;

    this.expiredTime = new Date(Number(req.expiredTime));
    this.eddsaSig = req.eddsaSig;
    
    this._req = req;
    this.timestamp = timestamp;
    this.txId = txId;
  }
  encode(): bigint[] {
    return encodeTxAuctionLendMessage(this._req);
  }
  encodeOrderLeaf(): string {
    const lendLeaf = toTreeLeaf([...this.encode(), BigInt(this.txId)]);
    return lendLeaf;
  }
}

