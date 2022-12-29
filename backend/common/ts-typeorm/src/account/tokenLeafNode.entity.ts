import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, JoinTable, OneToOne, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { TokenMerkleTreeNode } from './tokenMerkleTreeNode.entity';

@Entity('TokenLeafNode', { schema: 'public'})
export class TokenLeafNode {
  @PrimaryColumn({
    type: 'decimal',
    name: 'leafId',
    precision: 86,
    scale: 0,
    primary: true,
    nullable: false,
  })
  leafId!: string;
  @PrimaryColumn({
    type: 'decimal',
    name: 'accountId',
    precision: 86,
    scale: 0,
    primary: true,
    nullable: false,
  })
  accountId!: string;
  @Column({
    type: 'decimal',
    name: 'L2TokenAddr',
    precision: 86,
    scale: 0,
    nullable: false,
  })
  L2TokenAddr!: bigint;
  @Column({
    type: 'decimal',
    name: 'availableAmt',
    precision: 86,
    scale: 0,
    default: 0n
  })
  availableAmt!: bigint;
  @Column({
    type: 'decimal',
    name: 'lockedAmt',
    precision: 86,
    scale: 0,
    default: 0n
  })
  lockedAmt!: bigint;
  @OneToOne(
    () => TokenMerkleTreeNode,
    (tokenMerkleTreeNode: TokenMerkleTreeNode) => tokenMerkleTreeNode.leaf,
    { onDelete: 'RESTRICT', onUpdate: 'CASCADE' }
  )
  @JoinColumn([{ name: 'leafId', referencedColumnName: 'leafId' },
  { name: 'accountId', referencedColumnName: 'accountId' }])
  tokenMerkleNode!: TokenMerkleTreeNode;
}