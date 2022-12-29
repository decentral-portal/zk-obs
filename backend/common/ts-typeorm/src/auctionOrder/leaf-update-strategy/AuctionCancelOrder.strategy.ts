import { BadRequestException } from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';
import { TsTxAuctionLendRequest, TsTxAuctionBorrowRequest, TsTxAuctionCancelRequest } from '@common/ts-typeorm/account/dto/ts-req-types';
import { toTsTxType, TsTxType } from '@common/ts-typeorm/account/dto/ts-type';
import { TsAuctionEmptyOrder } from '@common/ts-typeorm/account/dto/TxAuctionEmptyOrder.dto';
import { AuctionOrderLeafNode } from '@common/ts-typeorm/auctionOrder/auctionOrderLeafNode.entity';
import { CancelOrderValidator } from '@common/ts-typeorm/auctionOrder/validator/CancelOrder.validator';
import { AuctionBorrowOrderStrategy } from '@common/ts-typeorm/auctionOrder/validator/AuctionBorrowOrder.strategy';
import { AuctionLendOrderStrategy } from '@common/ts-typeorm/auctionOrder/validator/AuctionLendOrder.strategy';
import { LeafUpdaterStrategy } from '@common/ts-typeorm/auctionOrder/leaf-update-strategy/LeafUpdaterStrategy.interface';
import { AuctionOrderMerkleTreeNode } from '@common/ts-typeorm/auctionOrder/auctionOrderMerkleTreeNode.entity';

export class AuctionCancelOrderStrategy implements LeafUpdaterStrategy {
  private orderId = 0;
  private validator: CancelOrderValidator;
  constructor(
    private readonly auctionOrderLeafRepository: Repository<AuctionOrderLeafNode>
  ) {
    this.auctionOrderLeafRepository = auctionOrderLeafRepository;
    this.validator = new CancelOrderValidator();
    this.validator.use(TsTxType.AUCTION_LEND, new AuctionLendOrderStrategy());
    this.validator.use(TsTxType.AUCTION_BORROW, new AuctionBorrowOrderStrategy());
  }
  async updateLeaf (
    manager: EntityManager,
    value: TsTxAuctionLendRequest | TsTxAuctionBorrowRequest | TsTxAuctionCancelRequest, orderId: number, txId: bigint, id: bigint) {
    const cancelReq = value as TsTxAuctionCancelRequest;
    const leafId = BigInt(cancelReq.orderLeafId);
    const order = await this.auctionOrderLeafRepository.findOneBy({ leafId: leafId.toString() });
    const CancelOrderId = Number(leafId);
    this.orderId = CancelOrderId;
    if (!order) {
      throw new BadRequestException(`auction order id= ${CancelOrderId} not found`);
    }
    const reqType: TsTxType = toTsTxType(order.reqType.toString());
    this.validator.doValidate(reqType, cancelReq, order, CancelOrderId);
    const emptyOrder = new TsAuctionEmptyOrder();
    // update leaf
    await manager.upsert(AuctionOrderLeafNode, {
      leafId: CancelOrderId.toString(),
      reqType: toTsTxType('0'),
      L2AddrFrom: BigInt(0),
      L2AddrTo: BigInt(0),
      L2TokenAddr: BigInt(0),
      amount: BigInt(0),
      maturityDate: BigInt(0),
      expiredTime: BigInt(0),
      interest: BigInt(0),
      L2TokenAddrBorrowing: BigInt(0),
      borrowingAmt: BigInt(0),
    }, ['leafId']),
    await manager.update(AuctionOrderMerkleTreeNode, { leafId: BigInt(CancelOrderId) }, {
      hash: BigInt(emptyOrder.encodeOrderLeaf()),
    });    
  }
  error () {
    return new BadRequestException(`[AuctionCancelOrderStrategy] orderId ${this.orderId} update lead failed`);
  }
}