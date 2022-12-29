import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryColumn, Unique } from 'typeorm';
import { AccountMerkleTreeNode } from './accountMerkleTreeNode.entity';
import { TokenLeafNode } from './tokenLeafNode.entity';

@Entity('TokenMerkleTreeNode', { schema: 'public' })
export class TokenMerkleTreeNode {
  @PrimaryColumn({
    type: 'decimal',
    name: 'accountId',
    primary: true,
    precision: 86,
    scale: 0,
    nullable: false,
    unique: false,
  })
  accountId!: string; // compose primary key
  @PrimaryColumn({
    type: 'decimal',
    name: 'id',
    primary: true,
    precision: 86, 
    scale: 0,
    nullable: false,
    unique: false,
  })
  id!: string; // compose primary key
  @Column({
    type: 'decimal',
    name: 'hash',
    precision: 86,
    scale: 0,
    nullable: false
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
  leafId!: string|null;
  // relations
  @ManyToOne(
    () => AccountMerkleTreeNode,
    (accountMerkleTreeNode: AccountMerkleTreeNode) => accountMerkleTreeNode.tokenMerkleTreeNodes,
    { onDelete: 'RESTRICT', onUpdate: 'CASCADE' }
  )
  @JoinColumn({ name: 'accountId', referencedColumnName: 'leafId' })
  accountRoot!: AccountMerkleTreeNode;
  @OneToOne(
    () => TokenLeafNode,
    (tokenLeafNode: TokenLeafNode) => tokenLeafNode.tokenMerkleNode
  )
  @JoinColumn([{
    name: 'leafId',
    referencedColumnName: 'leafId'
  },{
    name: 'accountId',
    referencedColumnName: 'accountId'
  }])
  leaf!:TokenLeafNode;

}