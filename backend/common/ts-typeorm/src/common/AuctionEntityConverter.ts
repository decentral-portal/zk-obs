import { tslToMaturity, TsTxAuctionBorrowRequest, TsTxAuctionLendRequest } from '../account/dto/ts-req-types';
import { TsSystemAccountAddress, TsTokenAddress, TsTxType } from '../account/dto/ts-type';
import { TsAuctionBorrowOrder } from '../account/dto/TsAuctionBorrowOrder.dto';
import { TsAuctionLendOrder } from '../account/dto/TsAuctionLendOrder.dto';
import { AuctionOrderLeafNode } from '../auctionOrder/auctionOrderLeafNode.entity';
import { OrderEntityConverter } from './orderEntityConverter.interface';


const convertStringToTsTokenAddress = (address: string): TsTokenAddress => {
  const value = Object.values(TsTokenAddress).find((value) => value === address);
  if (value !== undefined) {
    return value;
  }
  return TsTokenAddress.UNKNOWN; 
}
export class AuctionLeafNodeEntityTsAuctionLendOrderConverter implements OrderEntityConverter<AuctionOrderLeafNode,TsAuctionLendOrder>{
  convertToVo(orderEntity: AuctionOrderLeafNode): TsAuctionLendOrder {
    const orderId = Number(orderEntity.leafId);
    const txId = orderEntity.txId;
    const req: TsTxAuctionLendRequest = {
      reqType: TsTxType.AUCTION_LEND,
      L2AddrFrom: orderEntity.L2AddrFrom.toString(10),
      L2AddrTo: TsSystemAccountAddress.AUCTION_ADDR,
      L2TokenAddrLending: convertStringToTsTokenAddress(orderEntity.L2TokenAddr.toString(10)),
      lendingAmt: orderEntity.amount.toString(10),
      nonce: orderEntity.nonce.toString(10),
      maturityDate: orderEntity.maturityDate.toString(10),
      expiredTime: orderEntity.expiredTime.toString(10),
      interest: orderEntity.interest.toString(10),
      ecdsaSig: '',
      eddsaSig: {
        R8: ['',''],
        S: '',
      },
      txId: orderEntity.txId.toString(10),
    };
    const timestamp = Date.now();
    const orderVo = new TsAuctionLendOrder(orderId, txId, req, timestamp);
    return orderVo;
  }
  convertFromVo(orderVo: TsAuctionLendOrder): AuctionOrderLeafNode {
    const orderEntity = new AuctionOrderLeafNode();
    orderEntity.leafId = orderVo.orderId.toString();
    orderEntity.txId = orderVo.txId;
    orderEntity.L2AddrFrom = BigInt(orderVo.L2AddrFrom);
    orderEntity.L2TokenAddr = BigInt(orderVo.L2TokenAddrLending);
    orderEntity.amount = BigInt(orderVo.lendingAmt);
    orderEntity.nonce = BigInt(orderVo.nonce);
    orderEntity.maturityDate = BigInt(orderVo.maturityDate);
    orderEntity.expiredTime = BigInt(orderVo.expiredTime.getTime());
    orderEntity.interest = BigInt(orderVo.interest);
    orderEntity.txId = orderVo.txId;
    return orderEntity;
  } 
}
export class AuctionLeafNodeEntityTsAuctionBorrowdOrderConverter implements OrderEntityConverter<AuctionOrderLeafNode, TsAuctionBorrowOrder> {
  convertToVo(orderEntity: AuctionOrderLeafNode): TsAuctionBorrowOrder {
    const orderId = Number(orderEntity.leafId);
    const txId = orderEntity.txId;
    const req: TsTxAuctionBorrowRequest = {
      reqType: TsTxType.AUCTION_BORROW,
      L2AddrFrom: orderEntity.L2AddrFrom.toString(10),
      L2AddrTo: TsSystemAccountAddress.AUCTION_ADDR,
      L2TokenAddrCollateral: convertStringToTsTokenAddress(orderEntity.L2TokenAddr.toString(10)),
      collateralAmt: orderEntity.amount.toString(10),
      nonce: orderEntity.nonce.toString(10),
      maturityDate: orderEntity.maturityDate.toString(10),
      expiredTime: orderEntity.expiredTime.toString(10),
      interest: orderEntity.interest.toString(10),
      ecdsaSig: '',
      eddsaSig: {
        R8: ['',''],
        S: '',
      },
      
      L2TokenAddrBorrowing: tslToMaturity(convertStringToTsTokenAddress(orderEntity.L2TokenAddrBorrowing.toString(10))),
      borrowingAmt: orderEntity.borrowingAmt.toString(10),
      txId: orderEntity.txId.toString(10),
    };
    const timestamp = Date.now();
    const orderVo = new TsAuctionBorrowOrder(orderId, txId, req, timestamp);
    return orderVo;
  }
  convertFromVo(orderVo: TsAuctionBorrowOrder): AuctionOrderLeafNode {
    const orderEntity = new AuctionOrderLeafNode();
    orderEntity.leafId = orderVo.orderId.toString();
    orderEntity.txId = orderVo.txId;
    orderEntity.L2AddrFrom = BigInt(orderVo.L2AddrFrom);
    orderEntity.L2TokenAddr = BigInt(orderVo.L2TokenAddrCollateral);
    orderEntity.amount = BigInt(orderVo.collateralAmt);
    orderEntity.nonce = BigInt(orderVo.nonce);
    orderEntity.maturityDate = BigInt(orderVo.maturityDate);
    orderEntity.expiredTime = BigInt(orderVo.expiredTime.getTime());
    orderEntity.interest = BigInt(orderVo.interest);
    orderEntity.L2TokenAddrBorrowing = BigInt(orderVo.L2TokenAddrTSL);
    orderEntity.borrowingAmt = BigInt(orderVo.lendingAmt);
    orderEntity.txId = orderVo.txId;
    return orderEntity;
  }
}