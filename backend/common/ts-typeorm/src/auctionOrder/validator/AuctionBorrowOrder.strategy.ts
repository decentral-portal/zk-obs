import { BadRequestException } from '@nestjs/common';
import { TsTxAuctionCancelRequest } from '../../account/dto/ts-req-types';
import { TsTokenAddress } from '../../account/dto/ts-type';
import { AuctionLeafNodeEntityTsAuctionBorrowdOrderConverter } from '../../common/AuctionEntityConverter';
import { AuctionOrderLeafNode } from '../auctionOrderLeafNode.entity';
import { ValidatorStrategy } from './ValidatorStrategy.interface';

export class AuctionBorrowOrderStrategy implements ValidatorStrategy {
  validate(value: TsTxAuctionCancelRequest, order: AuctionOrderLeafNode): boolean {
    const converter = new AuctionLeafNodeEntityTsAuctionBorrowdOrderConverter();
    const targetOrder = converter.convertToVo(order);
    const isValid = targetOrder.L2AddrFrom !== BigInt(value.L2AddrTo) 
    || targetOrder.L2AddrTo !== String(value.L2AddrFrom)
    || targetOrder.L2TokenAddrCollateral !== value.L2TokenAddrRefunded as TsTokenAddress
    || targetOrder.lendingAmt !== BigInt(value.amount)
    if (!isValid) {
      console.error({
        targetOrder,
        value
      });
    }
    return isValid;
  }
  error(orderId: number): BadRequestException {
    return new BadRequestException(`auction borrow order id=${orderId} is invalid`);
  }
}