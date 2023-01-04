import { TsTxType } from '@ts-sdk/domain/lib/ts-types/ts-types';
import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { AuctionOrderMerkleTreeNode } from './auctionOrderMerkleTreeNode.entity';

@Entity('AuctionOrderLeafNode', {schema: 'public'})
export class AuctionOrderLeafNode {
  @PrimaryColumn({
    type: 'decimal',
    name: 'leafId',
    primary: true,
    precision: 86,
    scale: 0,
  })
  leafId!: string;
  @Column({
    type: 'decimal',
    name: 'txId',
    precision: 86,
    scale: 0,
    nullable: false,
    default: 0,
  })
  txId!: string;
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
    nullable: false,
    default: 0,
  })
  L2AddrFrom!: string;
  @Column({
    type: 'decimal',
    name: 'L2AddrTo',
    precision: 86,
    scale: 0,
    nullable: false,
    default: 0,
  })
  L2AddrTo!: string;
  @Column({
    type: 'decimal',
    name: 'L2TokenAddr',
    precision: 86,
    scale: 0,
    nullable: false,
    default: 0,
  })
  L2TokenAddr!: string;
  @Column({
    type: 'decimal',
    name: 'amount',
    precision: 86,
    scale: 0,
    nullable: false,
    default: 0,
  })
  amount!: string;
  @Column({
    type: 'decimal',
    name: 'nonce',
    precision: 86,
    scale: 0,
    nullable: false,
    default: 0,
  })
  nonce!: string;
  @Column({
    type: 'decimal',
    name: 'maturityDate',
    precision: 86,
    scale: 0,
    nullable: false,
    default: 0,
  })
  maturityDate!: string;
  @Column({
    type: 'decimal',
    name: 'expiredTime',
    precision: 86,
    scale: 0,
    nullable: false,
    default: 0,
  })
  expiredTime!: string;
  @Column({
    type: 'decimal',
    name: 'interest',
    precision: 86,
    scale: 0,
    nullable: false,
    default: 0,
  })
  interest!: string;
  @Column({
    type: 'decimal',
    name: 'L2TokenAddrBorrowing',
    precision: 86,
    scale: 0,
    nullable: false,
    default: 0,
  })
  L2TokenAddrBorrowing!: string;
  @Column({
    type: 'decimal',
    name: 'borrowingAmt',
    precision: 86,
    scale: 0,
    nullable: false,
    default: 0,
  })
  borrowingAmt!: string;
  // relations
  // @ManyToOne(
  //   () => AccountInformation,
  //   (accountInformation:AccountInformation) => accountInformation.fromAuctionOrderLeafNodes,
  //   { onDelete: 'RESTRICT', onUpdate: 'CASCADE' }
  // )
  // @JoinColumn({
  //   name: 'L2AddrFrom',
  //   referencedColumnName: 'accountId',
  // })
  // L2AddrFromAccount!: AccountInformation;
  // @ManyToOne(
  //   () => AccountInformation,
  //   (accountInformation:AccountInformation) => accountInformation.toAuctionOrderLeafNodes,
  //   { onDelete: 'RESTRICT', onUpdate: 'CASCADE' }
  // )
  // @JoinColumn({
  //   name: 'L2AddrTo',
  //   referencedColumnName: 'accountId',
  // })
  // L2AddrToAccount!: AccountInformation;
  @OneToOne(
    () => AuctionOrderMerkleTreeNode,
    (auctionOrderMerkleTreeNode:AuctionOrderMerkleTreeNode) => auctionOrderMerkleTreeNode.auctionOrderLeafNode,
    { onDelete: 'RESTRICT', onUpdate: 'CASCADE' }
  )
  @JoinColumn({ name: 'leafId', referencedColumnName: 'leafId' })
  auctionOrderMerkleTreeNode!: AuctionOrderMerkleTreeNode;
}