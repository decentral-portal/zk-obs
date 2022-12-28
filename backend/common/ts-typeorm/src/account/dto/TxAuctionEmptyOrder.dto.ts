import { toTreeLeaf } from '../../common/ts-helper';
import { ITsAuctionOrder } from './ITsAuctionOrder.interface';
import { EdDSASignatureRequestType } from './ts-req-types';
import { TsSystemAccountAddress, TsTokenAddress, TsTxType } from './ts-type';

export class TsAuctionEmptyOrder implements ITsAuctionOrder {
  txId = 0n;
  orderId = 0;
  reqType: TsTxType.AUCTION_LEND | TsTxType.AUCTION_BORROW = TsTxType.UNKNOWN as any;
  L2AddrFrom = BigInt(TsSystemAccountAddress.MINT_ADDR);
  L2AddrTo: TsSystemAccountAddress.AUCTION_ADDR = TsSystemAccountAddress.AUCTION_ADDR;
  L2TokenAddrLending: TsTokenAddress = TsTokenAddress.UNKNOWN;
  L2TokenAddrTSL = TsTokenAddress.UNKNOWN;
  interest = 0n;
  lendingAmt = 1n;
  L2TokenAddrCollateral: TsTokenAddress = TsTokenAddress.UNKNOWN;
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
      BigInt(this.L2AddrTo),
      BigInt(this.L2TokenAddrCollateral),
      this.collateralAmt, // amount
      this.nonce, // nonce
      0n, // maturityDate
      0n, // expiredTime
      this.interest, // interest
      BigInt(this.L2TokenAddrLending), // L2TokenAddrBorrowing
      this.lendingAmt, // borrowingAmt
      this.txId,
    ];
  }
  public encodeOrderLeaf(): string {
    return toTreeLeaf(this.encode());
  }
}