import { BadRequestException } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { TsTxAuctionLendRequest, TsTxAuctionBorrowRequest, TsTxAuctionCancelRequest } from '../../account/dto/ts-req-types';

export interface LeafUpdaterStrategy {
  updateLeaf: (
    manager: EntityManager,
    value: TsTxAuctionLendRequest | TsTxAuctionBorrowRequest | TsTxAuctionCancelRequest, orderId: number, txId: bigint, id: bigint) => Promise<void>;
  error: () => BadRequestException;
}