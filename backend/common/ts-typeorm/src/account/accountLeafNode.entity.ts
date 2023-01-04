import { AccountLeafEncodeType } from '@ts-sdk/domain/lib/ts-types/ts-types';
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, OneToOne, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { toTreeLeaf } from '../common/ts-helper';
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
  leafId!: string; 
  @Column({
    type: 'decimal',
    name: 'tsAddr',
    precision: 86,
    scale: 0,
    nullable: false,
    default: 0n,
  })
  tsAddr!: string;
  @Column({
    type: 'decimal',
    name: 'nonce',
    precision: 86,
    scale: 0,
    nullable: false,
    default: 0n
  })
  nonce!: string;
  @Column({
    type: 'decimal',
    name: 'tokenRoot',
    precision: 86,
    scale: 0,
    nullable: false,
    default: 0n
  })
  tokenRoot!: string;
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


  encode(): AccountLeafEncodeType {
    return [
      BigInt(this.tsAddr), BigInt(this.nonce), BigInt(this.tokenRoot)
    ];
  }

  encodeHash(): string {
    return toTreeLeaf(this.encode());
  }
}