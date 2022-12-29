import { BadRequestException } from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';
import { TsTxAuctionBorrowRequest, TsTxAuctionCancelRequest, TsTxAuctionLendRequest } from '../../account/dto/ts-req-types';
import { TsAuctionLendOrder } from '../../account/dto/TsAuctionLendOrder.dto';
import { AuctionOrderLeafNode } from '../auctionOrderLeafNode.entity';
import { AuctionOrderMerkleTreeNode } from '../auctionOrderMerkleTreeNode.entity';
import { LeafUpdaterStrategy } from './LeafUpdaterStrategy.interface';

export class AuctionLendOrderStrategy implements LeafUpdaterStrategy {
  private orderId = 0;
  async updateLeaf (
    manager: EntityManager,
    value: TsTxAuctionLendRequest | TsTxAuctionBorrowRequest | TsTxAuctionCancelRequest, orderId: number, txId: bigint, id: bigint) {
    const time = Date.now();
    const order = new TsAuctionLendOrder(orderId, txId, value as TsTxAuctionLendRequest, time);
    this.orderId = orderId;
    await manager.upsert(AuctionOrderMerkleTreeNode, {
      id: id.toString(),
      leafId: BigInt(orderId),
      hash: BigInt(order.encodeOrderLeaf())
    }, ['id']);
    await manager.upsert(AuctionOrderLeafNode, {
      leafId: orderId.toString(),
      reqType: order.reqType,
      L2AddrFrom: BigInt(order.L2AddrFrom),
      L2AddrTo: BigInt(order.L2AddrTo),
      L2TokenAddr: BigInt(order.L2TokenAddrLending),
      amount: BigInt(order.lendingAmt),
      nonce: BigInt(order.nonce),
      maturityDate: BigInt(order.maturityDate),
      expiredTime: BigInt(order.expiredTime.getTime()),
      interest: BigInt(order.interest),
    }, ['leafId']);
  }
  error () {
    return new BadRequestException(`[AuctionLendOrderStrategy] orderId ${this.orderId} update lead failed`);
  }

}