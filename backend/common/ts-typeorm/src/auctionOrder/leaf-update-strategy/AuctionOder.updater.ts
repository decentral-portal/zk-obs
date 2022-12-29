import { BadRequestException } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { TsTxAuctionLendRequest, TsTxAuctionBorrowRequest, TsTxAuctionCancelRequest } from '../../account/dto/ts-req-types';
import { TsTxType } from '../../account/dto/ts-type';
import { LeafUpdaterStrategy } from './LeafUpdaterStrategy.interface';

export class AuctionOrderUpdater {
  private updaters: Map<TsTxType, LeafUpdaterStrategy> = new Map<TsTxType, LeafUpdaterStrategy>();
  use(reqType: TsTxType, updater: LeafUpdaterStrategy) {
    this.updaters.set(reqType, updater);
  }
  async doUpdate(manager: EntityManager,
    reqType: TsTxType, 
    value: TsTxAuctionLendRequest | TsTxAuctionBorrowRequest | TsTxAuctionCancelRequest, 
    orderId: number,
    txId: bigint,
    id: bigint
    ) 
  {
    const updater = this.updaters.get(reqType);
    if (updater) {
      try {
        await updater.updateLeaf(manager, value, orderId, txId, id);
        return;
      } catch (error) {
        throw updater.error();
      }
    }
    throw new BadRequestException(`No updater for reqType:${reqType}`);
  }
}