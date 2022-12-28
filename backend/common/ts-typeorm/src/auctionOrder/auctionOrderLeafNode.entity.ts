import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryColumn } from 'typeorm';
import { AccountInformation } from '../account/accountInformation.entity';
import { TsTxType } from '../account/dto/ts-type';
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
  txId!: bigint;
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
  L2AddrFrom!: bigint;
  @Column({
    type: 'decimal',
    name: 'L2AddrTo',
    precision: 86,
    scale: 0,
    nullable: false,
    default: 0,
  })
  L2AddrTo!: bigint;
  @Column({
    type: 'decimal',
    name: 'L2TokenAddr',
    precision: 86,
    scale: 0,
    nullable: false,
    default: 0,
  })
  L2TokenAddr!: bigint;
  @Column({
    type: 'decimal',
    name: 'amount',
    precision: 86,
    scale: 0,
    nullable: false,
    default: 0,
  })
  amount!: bigint;
  @Column({
    type: 'decimal',
    name: 'nonce',
    precision: 86,
    scale: 0,
    nullable: false,
    default: 0,
  })
  nonce!: bigint;
  @Column({
    type: 'decimal',
    name: 'maturityDate',
    precision: 86,
    scale: 0,
    nullable: false,
    default: 0,
  })
  maturityDate!: bigint;
  @Column({
    type: 'decimal',
    name: 'expiredTime',
    precision: 86,
    scale: 0,
    nullable: false,
    default: 0,
  })
  expiredTime!: bigint;
  @Column({
    type: 'decimal',
    name: 'interest',
    precision: 86,
    scale: 0,
    nullable: false,
    default: 0,
  })
  interest!: bigint;
  @Column({
    type: 'decimal',
    name: 'L2TokenAddrBorrowing',
    precision: 86,
    scale: 0,
    nullable: false,
    default: 0,
  })
  L2TokenAddrBorrowing!: bigint;
  @Column({
    type: 'decimal',
    name: 'borrowingAmt',
    precision: 86,
    scale: 0,
    nullable: false,
    default: 0,
  })
  borrowingAmt!: bigint;
  // relations
  @ManyToOne(
    () => AccountInformation,
    (accountInformation:AccountInformation) => accountInformation.fromAuctionOrderLeafNodes,
    { onDelete: 'RESTRICT', onUpdate: 'CASCADE' }
  )
  @JoinColumn({
    name: 'L2AddrFrom',
    referencedColumnName: 'L2Address',
  })
  L2AddrFromAccount!: AccountInformation;
  @ManyToOne(
    () => AccountInformation,
    (accountInformation:AccountInformation) => accountInformation.toAuctionOrderLeafNodes,
    { onDelete: 'RESTRICT', onUpdate: 'CASCADE' }
  )
  @JoinColumn({
    name: 'L2AddrTo',
    referencedColumnName: 'L2Address',
  })
  L2AddrToAccount!: AccountInformation;
  @OneToOne(
    () => AuctionOrderMerkleTreeNode,
    (auctionOrderMerkleTreeNode:AuctionOrderMerkleTreeNode) => auctionOrderMerkleTreeNode.auctionOrderLeafNode,
    { onDelete: 'RESTRICT', onUpdate: 'CASCADE' }
  )
  @JoinColumn({ name: 'leafId', referencedColumnName: 'leafId' })
  auctionOrderMerkleTreeNode!: AuctionOrderMerkleTreeNode;
}