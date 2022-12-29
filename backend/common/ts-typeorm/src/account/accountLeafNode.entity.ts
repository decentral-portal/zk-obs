import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, OneToOne, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { AccountMerkleTreeNode } from './accountMerkleTreeNode.entity';

@Entity('AccountLeafNode', { schema: 'public'})
export class AccountLeafNode {
  @PrimaryColumn({
    type: 'decimal',
    name: 'leafId',
    primary: true,
    precision: 86,
    scale: 0
  })
  leafId!: bigint; 
  @Column({
    type: 'decimal',
    name: 'tsPubKeyX',
    precision: 86,
    scale: 0,
    nullable: false,
    default: 0n,
  })
  tsPubKeyX!: bigint;
  @Column({
    type: 'decimal',
    name: 'tsPubKeyY',
    precision: 86,
    scale: 0,
    nullable: false,
    default: 0n
  })
  tsPubKeyY!: bigint;
  @Column({
    type: 'decimal',
    name: 'nonce',
    precision: 86,
    scale: 0,
    nullable: false,
    default: 0n
  })
  nonce!: bigint;
  @Column({
    type: 'decimal',
    name: 'tokenRoot',
    precision: 86,
    scale: 0,
    nullable: false,
    default: 0n
  })
  tokenRoot!: bigint;
  // relations
  @OneToOne(
    () => AccountMerkleTreeNode,
    (accountMerkleTreeNode:AccountMerkleTreeNode) => accountMerkleTreeNode.accountLeafNode, 
    { onDelete: 'RESTRICT', onUpdate: 'CASCADE' }
  )
  @JoinColumn({
    name: 'leafId',
    referencedColumnName: 'leafId'
  })
  accountMerkleTreeNode!: AccountMerkleTreeNode;
}