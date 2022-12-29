import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryColumn } from 'typeorm';
import { AccountInformation } from '@common/ts-typeorm/account/accountInformation.entity';
import { TsTxType } from '@common/ts-typeorm/account/dto/ts-type';
import { BaseTimeEntity } from '@common/ts-typeorm/common/baseTimeEntity';
import { AuctionMatchOrder } from '@common/ts-typeorm/auctionOrder/auctionMatchOrder.entity';

@Entity('AuctionMainOrder', { schema: 'public' })
export class AuctionMainOrder extends BaseTimeEntity {
  @PrimaryColumn({
    type: 'decimal',
    name: 'orderId',
    precision: 86,
    scale: 0,
  })
  orderId!: bigint;
  @Column({
    type: 'integer',
    name: 'reqType',
    nullable: false,
  })
  reqType!: TsTxType;
  @Column({ 
    type: 'decimal',
    name: 'L2AddrFrom',
    precision: 86,
    scale: 0,
    nullable: true,
    default: 0
  })
  L2AddrFrom!: bigint;
  @Column({ 
    type: 'decimal',
    name: 'L2AddrTo',
    precision: 86,
    scale: 0,
    nullable: true,
    default: 0
  })
  L2AddrTo!: bigint;
  @Column({ 
    type: 'decimal',
    name: 'L2AddrTokenLending',
    precision: 86,
    scale: 0,
    nullable: true,
    default: 0
  })
  L2AddrTokenLending!: bigint;
  @Column({
    type: 'decimal',
    name: 'lendingAmt',
    precision: 86,
    scale: 0,
    nullable: true,
    default: 0
  })
  lendingAmt!: bigint;
  @Column({ 
    type: 'decimal',
    name: 'L2AddrTokenCollateral',
    precision: 86,
    scale: 0,
    nullable: true,
    default: 0
  })
  L2AddrTokenCollateral!: bigint;
  @Column({
    type: 'decimal',
    name: 'collateralAmt',
    precision: 86,
    scale: 0,
    nullable: true,
    default: 0
  })
  collateralAmt!: bigint;
  @Column({ 
    type: 'decimal',
    name: 'L2AddrTokenBorrowing',
    precision: 86,
    scale: 0,
    nullable: true,
    default: 0
  })
  L2AddrTokenBorrowing!: bigint;
  @Column({
    type: 'decimal',
    name: 'borrowingAmt',
    precision: 86,
    scale: 0,
    nullable: true,
    default: 0
  })
  borrowingAmt!: bigint;
  @Column({
    type: 'decimal',
    name: 'L2TokenAddrTSL',
    precision: 86,
    scale: 0,
    nullable: true,
    default: 0
  })
  L2TokenAddrTSL!: bigint;
  @Column({
    type: 'decimal',
    name: 'interest',
    precision: 86,
    scale: 0,
    nullable: true,
    default: 0
  })
  interest!: bigint;
  @Column({
    type: 'decimal',
    name: 'nonce',
    precision: 86,
    scale: 0,
    nullable: true,
    default: 0
  })
  nonce!: bigint;
  @Column({
    type: 'timestamp without time zone',
    name: 'expiredTime',
    nullable: true,
    default: 'now()',
  })
  expiredTime!: Date;
  @Column({
    type: 'timestamp without time zone',
    name: 'maturityDate',
    nullable: true,
    default: 'now()',
  })
  maturityDate!: Date;
  @Column({
    type: 'integer',
    name: 'orderStatus',
    nullable: true,
    default: 0,
  })
  orderStatus!: number;
  @ManyToOne(
    () => AccountInformation,
    accountInformation => accountInformation.fromAuctionMainOrders,
    {
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE'
    }
  )
  @JoinColumn({
    name: 'L2AddrFrom',
    referencedColumnName: 'L2Address'
  })
  L2AddrFromAccount!: AccountInformation;
  @ManyToOne(
    () => AccountInformation,
    accountInformation => accountInformation.toAuctionMainOrders,
    { 
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE'
    }
  )
  @JoinColumn({
    name: 'L2AddrTo',
    referencedColumnName: 'L2Address'
  })
  L2AddrToAccount!: AccountInformation;
  @OneToMany(
    () => AuctionMatchOrder,
    (auctionMatchOrder: AuctionMatchOrder )=> auctionMatchOrder.MainOrder
  )
  MatchOrders!: AuctionMatchOrder[];
}