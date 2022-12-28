import { BadRequestException } from '@nestjs/common';
import { TsTxAuctionCancelRequest } from '../../account/dto/ts-req-types';
import { TsTxType } from '../../account/dto/ts-type';
import { AuctionOrderLeafNode } from '../auctionOrderLeafNode.entity';
import { ValidatorStrategy } from './ValidatorStrategy.interface';

export class CancelOrderValidator {
  private strategies: Map<TsTxType, ValidatorStrategy> = new Map<TsTxType, ValidatorStrategy>();
  use(reqType: TsTxType, strategy: ValidatorStrategy) {
    this.strategies.set(reqType,strategy);
  }
  doValidate(reqType: TsTxType, 
    req: TsTxAuctionCancelRequest,
    value: AuctionOrderLeafNode,
     orderId: number) {
    const strategy = this.strategies.get(reqType);
    if (strategy) {
      const isValid = strategy.validate(req, value);
      if (!isValid) {
        throw strategy.error(orderId);
      }
      return;
    }
    throw new BadRequestException(`No strategy for ${reqType}`);
  }
}