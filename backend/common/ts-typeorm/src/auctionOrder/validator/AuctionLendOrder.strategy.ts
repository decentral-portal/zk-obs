import { BadRequestException } from '@nestjs/common';
import { TsTxAuctionCancelRequest } from '../../account/dto/ts-req-types';
import { TsTokenAddress } from '../../account/dto/ts-type';
import { AuctionLeafNodeEntityTsAuctionLendOrderConverter } from '../../common/AuctionEntityConverter';
import { AuctionOrderLeafNode } from '../auctionOrderLeafNode.entity';
import { ValidatorStrategy } from './ValidatorStrategy.interface';

export class AuctionLendOrderStrategy implements ValidatorStrategy {
  
  validate(value: TsTxAuctionCancelRequest, order: AuctionOrderLeafNode): boolean {
    const converter = new AuctionLeafNodeEntityTsAuctionLendOrderConverter();
    const targetOrder = converter.convertToVo(order);
    const isValid = targetOrder.L2AddrFrom !== BigInt(value.L2AddrTo) 
    || targetOrder.L2AddrTo !== String(value.L2AddrFrom)
    || targetOrder.L2TokenAddrLending !== value.L2TokenAddrRefunded as TsTokenAddress
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
    return new BadRequestException(`auction lend order id=${orderId} is invalid`);
  }
}