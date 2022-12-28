import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { AuctionOrderLeafNode } from './auctionOrderLeafNode.entity';

@Entity('AuctionOrderMerkleTreeNode', {schema: 'public'})
export class AuctionOrderMerkleTreeNode {
  @PrimaryColumn({
    type: 'decimal',
    name: 'id',
    primary: true,
    precision: 86,
    scale: 0,
  })
  id!: string;
  @Column({
    type: 'decimal',
    name: 'hash',
    precision: 86,
    scale: 0,
    nullable: false,
  })
  hash!: bigint;
  @Column({
    type: 'decimal',
    name: 'leafId',
    precision: 86,
    scale: 0,
    nullable: true,
    unique: true,
  })
  leafId!: bigint | null;
  @OneToOne(
    () => AuctionOrderLeafNode,
    (auctionOrderLeafNode: AuctionOrderLeafNode) => auctionOrderLeafNode.auctionOrderMerkleTreeNode,
  ) 
  auctionOrderLeafNode!: AuctionOrderLeafNode;
}
