import { BadRequestException } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { TsTxAuctionLendRequest, TsTxAuctionBorrowRequest, TsTxAuctionCancelRequest } from '@common/ts-typeorm/account/dto/ts-req-types';
import { TsAuctionBorrowOrder } from '@common/ts-typeorm/account/dto/TsAuctionBorrowOrder.dto';
import { AuctionOrderLeafNode } from '@common/ts-typeorm/auctionOrder/auctionOrderLeafNode.entity';
import { AuctionOrderMerkleTreeNode } from '@common/ts-typeorm/auctionOrder/auctionOrderMerkleTreeNode.entity';
import { LeafUpdaterStrategy } from '@common/ts-typeorm/auctionOrder/leaf-update-strategy/LeafUpdaterStrategy.interface';

export class AuctionBorrowOrderStrategy implements LeafUpdaterStrategy {
  private orderId = 0;
  async updateLeaf(manager: EntityManager,
    value: TsTxAuctionLendRequest | TsTxAuctionBorrowRequest | TsTxAuctionCancelRequest, orderId: number, txId: bigint, id: bigint) {
    const time = Date.now();
    const order = new TsAuctionBorrowOrder(orderId, txId, value as TsTxAuctionBorrowRequest, time);
    this.orderId = orderId;
    // update leaf
    await manager.upsert(AuctionOrderMerkleTreeNode,{
      id: id.toString(),
      leafId: BigInt(orderId),
      hash: BigInt(order.encodeOrderLeaf()),
    }, [
      'id'
    ]);
    await manager.upsert(AuctionOrderLeafNode, {
      leafId: orderId.toString(),
      reqType: order.reqType,
      L2AddrFrom: BigInt(order.L2AddrFrom),
      L2AddrTo: BigInt(order.L2AddrTo),
      L2TokenAddr: BigInt(order.L2TokenAddrCollateral),
      amount: BigInt(order.collateralAmt),
      nonce: BigInt(order.nonce),
      maturityDate: BigInt(order.maturityDate),
      expiredTime: BigInt(order.expiredTime.getTime()),
      interest: BigInt(order.interest),
      L2TokenAddrBorrowing: BigInt(order.L2TokenAddrTSL),
      borrowingAmt: BigInt(order.lendingAmt),
    }, ['leafId']);
  }
  error() {
    return new BadRequestException(`[${AuctionBorrowOrderStrategy.name}] orderId :${this.orderId} failed`);
  }

}