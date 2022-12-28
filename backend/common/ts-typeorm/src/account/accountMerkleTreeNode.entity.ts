import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryColumn } from 'typeorm';
import { AccountInformation } from './accountInformation.entity';
import { AccountLeafNode } from './accountLeafNode.entity';
import { TokenMerkleTreeNode } from './tokenMerkleTreeNode.entity';

@Entity('AccountMerkleTreeNode', { schema: 'public'})
export class AccountMerkleTreeNode {
  @PrimaryColumn({
    type: 'decimal',
    name: 'id',
    precision: 86,
    scale: 0,
    primary: true,
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
  })
  leafId!: bigint|null;
  @OneToOne(
    () => AccountInformation, // mapType
    (accountInformation: AccountInformation) => accountInformation.accountMerkleTreeNode , // map attribute
    { onDelete: 'RESTRICT', onUpdate: 'CASCADE' } 
  )
  @JoinColumn([{ name: 'leafId', referencedColumnName: 'L2Address' }])
  leaf!: AccountInformation;
  @OneToMany(
    () => TokenMerkleTreeNode,
    (tokenMerkleTreeNode: TokenMerkleTreeNode) => tokenMerkleTreeNode.accountRoot
  )
  tokenMerkleTreeNodes!: TokenMerkleTreeNode[];
  @OneToOne(
    () =>  AccountLeafNode,
    (accountLeafNode: AccountLeafNode) => accountLeafNode.accountMerkleTreeNode
  )
  accountLeafNode!: AccountLeafNode;
}