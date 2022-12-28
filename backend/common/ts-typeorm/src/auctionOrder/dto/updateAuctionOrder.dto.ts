import { TsTxAuctionBorrowRequest, TsTxAuctionCancelRequest, TsTxAuctionLendRequest } from '../../account/dto/ts-req-types';
import {  TsTxType } from '../../account/dto/ts-type';

export class UpdateAuctionOrderDto  {
  reqObject!: {
    reqType: TsTxType;
    txId: number;
  };
  req!: TsTxAuctionLendRequest | TsTxAuctionBorrowRequest | TsTxAuctionCancelRequest;
}