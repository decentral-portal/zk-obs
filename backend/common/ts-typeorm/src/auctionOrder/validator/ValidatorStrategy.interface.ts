import { BadRequestException } from '@nestjs/common';
import { TsTxAuctionCancelRequest } from '../../account/dto/ts-req-types';
import { AuctionOrderLeafNode } from '../auctionOrderLeafNode.entity';

export interface ValidatorStrategy {
  validate: (req: TsTxAuctionCancelRequest, value: AuctionOrderLeafNode) => boolean;
  error: (orderId: number) => BadRequestException;
}