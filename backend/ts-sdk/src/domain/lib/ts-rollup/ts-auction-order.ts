import { EdDSASignatureRequestType, TsTxAuctionBorrowRequest, TsTxAuctionLendRequest } from '../ts-types/ts-req-types';
import { TsSystemAccountAddress, TsTokenAddress, TsTxType } from '../ts-types/ts-types';
import { toTreeLeaf } from './ts-helper';
import { encodeTxAuctionLendMessage, encodeTxAuctionBorrowMessage } from './ts-tx-helper';

export interface ITsAuctionOrder {
  orderId: number;
  txId: bigint;
  reqType: TsTxType.AUCTION_LEND | TsTxType.AUCTION_BORROW | TsTxType.UNKNOWN;
  L2AddrFrom: bigint;
  L2AddrTo: TsSystemAccountAddress.AUCTION_ADDR;
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
  encode(): bigint[];
  encodeOrderLeaf(): string;  
}

export class TsAuctionEmptyOrder implements ITsAuctionOrder {
  txId = 0n;
  orderId = 0;
  reqType: TsTxType.AUCTION_LEND | TsTxType.AUCTION_BORROW = TsTxType.UNKNOWN as any;
  L2AddrFrom = BigInt(TsSystemAccountAddress.MINT_ADDR);
  L2AddrTo: TsSystemAccountAddress.AUCTION_ADDR = TsSystemAccountAddress.AUCTION_ADDR;
  L2TokenAddrLending: TsTokenAddress = TsTokenAddress.Unknown;
  L2TokenAddrTSL = TsTokenAddress.Unknown;
  interest = 0n;
  lendingAmt = 1n;
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
  L2TokenAddrCollateral = TsTokenAddress.Unknown;
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
    
    // TODO: valid expiredTime
    this.expiredTime = new Date(Number(req.expiredTime));

    // TODO: valid eddsaSig
    this.eddsaSig = req.eddsaSig;

    this._req = req;
    this.timestamp = timestamp;
    this.txId = txId;
  } 
  encode() {
    return encodeTxAuctionLendMessage(this._req);
  }
  encodeOrderLeaf(): string {
    const lendLeaf = toTreeLeaf([...this.encode(), BigInt(this.txId)]);
    return lendLeaf;
  }
  
}

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
    
    // TODO: check LTV
    this.L2TokenAddrCollateral = req.L2TokenAddrCollateral;
    this.collateralAmt = BigInt(req.collateralAmt);
    
    // TODO: valid expiredTime
    this.expiredTime = new Date(Number(req.expiredTime));

    // TODO: valid eddsaSig
    this.eddsaSig = req.eddsaSig;

    this._req = req;
    this.timestamp = timestamp;
    this.txId = txId;
  }
  encode() {
    return encodeTxAuctionBorrowMessage(this._req);
  }
  encodeOrderLeaf(): string {
    const borrowLeaf = toTreeLeaf([...this.encode(), BigInt(this.txId)]);
    return borrowLeaf;
  }
  
}

// TODO: maturityToTsl
export function maturityToTsl(underlying: TsTokenAddress, maturityDate: string): TsTokenAddress {
  const map: any = {
    [TsTokenAddress.WETH]: TsTokenAddress.TslETH20221231,
    [TsTokenAddress.WBTC]: TsTokenAddress.TslBTC20221231,
    [TsTokenAddress.USDT]: TsTokenAddress.TslUSDT20221231,
    [TsTokenAddress.USDC]: TsTokenAddress.TslUSDC20221231,
    [TsTokenAddress.DAI]: TsTokenAddress.TslDAI20221231,
  };
 
  if(map[underlying]) {
    return map[underlying];
  }
  console.error(underlying, 'maturityToTsl: not supported');
  throw new Error('invalid underlying token');
}

export function tslToInfo(tslToken: TsTokenAddress) {
  const map: any = {
    [TsTokenAddress.TslETH20221231]: {
      underlying: TsTokenAddress.WETH,
      maturityDate: 19357n,
    },
    [TsTokenAddress.TslBTC20221231]: {
      underlying: TsTokenAddress.WBTC,
      maturityDate: 19357n,
    },
    [TsTokenAddress.TslUSDT20221231]: {
      underlying: TsTokenAddress.USDT,
      maturityDate: 19357n,
    },
    [TsTokenAddress.TslUSDC20221231]: {
      underlying: TsTokenAddress.USDC,
      maturityDate: 19357n,
    },
    [TsTokenAddress.TslDAI20221231]: {
      underlying: TsTokenAddress.DAI,
      maturityDate: 19357n,
    },
  };
  if(map[tslToken]) {
    return map[tslToken];
  }
  throw new Error('invalid tsl token');
}
