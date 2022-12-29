import { TsTxType } from '@ts-sdk/domain/lib/ts-types/ts-types';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { AccountInformation } from '../account/accountInformation.entity';
import { BaseTimeEntity } from '../common/baseTimeEntity';
import { AuctionMainOrder } from './auctionMainOrder.entity';

@Entity('AuctionMatchOrder', { schema: 'public' })
export class AuctionMatchOrder extends BaseTimeEntity {
  @PrimaryColumn({
    type: 'integer',
    name: 'txId',
    primary: true,
  })
  txId!: number;
  @Column({
    type: 'integer',
    name: 'reqType',
    nullable: false,
  })
  reqType!: TsTxType;
  @Column({
    type: 'decimal',
    name: 'matchId',
    precision: 86,
    scale: 0,
    nullable: false
  })
  matchId!: bigint;
  @Column({
    type: 'decimal',
    name: 'orderId',
    precision: 86,
    scale: 0,
    nullable: false
  })
  orderId!: bigint;
  @Column({ 
    type: 'integer',
    name: 'blockNumber',
    nullable: false,
  })
  blockNumber!: number;
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
    default: 0,
  })
  expiredTime!: Date;
  @Column({
    type: 'timestamp without time zone',
    name: 'maturityDate',
    nullable: true,
    default: 0,
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
    (accountInformation) => accountInformation.fromAuctionMatchOrders,
    { 
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE' 
    }
  )
  @JoinColumn({
    name: 'L2AddrFrom',
    referencedColumnName: 'L2Address',
  })
  L2AddrFromAccount!: AccountInformation;
  @ManyToOne(
    () => AccountInformation,
    (accountInformation: AccountInformation) => accountInformation.toAuctionMatchOrders,
    { 
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE'
    }
  )
  @JoinColumn({
    name: 'L2AddrTo',
    referencedColumnName: 'L2Address',
  })
  L2AddrToAccount!: AccountInformation;
  @ManyToOne(
    () => AuctionMainOrder,
    (auctionMainOrder: AuctionMainOrder) => auctionMainOrder.MatchOrders,
    {
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE'
    }
  )
  @JoinColumn({
    name: 'matchId',
    referencedColumnName: 'orderId',
  })
  MainOrder!: AuctionMainOrder;
}