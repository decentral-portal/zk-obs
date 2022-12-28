import { Column, CreateDateColumn, DeleteDateColumn, Entity, OneToMany, OneToOne, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { AuctionMainOrder } from '../auctionOrder/auctionMainOrder.entity';
import { AuctionMatchOrder } from '../auctionOrder/auctionMatchOrder.entity';
import { AuctionOrderLeafNode } from '../auctionOrder/auctionOrderLeafNode.entity';
import { AccountMerkleTreeNode } from './accountMerkleTreeNode.entity';
import { Role } from './role.enum';
import { TransactionInfo } from './transactionInfo.entity';

@Entity('AccountInformation', { schema: 'public' })
export class AccountInformation {
  @PrimaryColumn({
    type: 'varchar', 
    name: 'L1Address', 
    length: 256, 
    primary: true, 
  })
  L1Address!: string;

  @Column({
    type: 'decimal', 
    name: 'L2Address',
    precision: 86, 
    scale: 0,
    nullable: false, 
  })
  L2Address!: string;

  @Column({
    type: 'varchar', 
    name: 'email',
    length: 256,
    nullable: false, 
    unique: true,
  })
  email!: string;

  @Column({
    type: 'varchar', 
    name: 'lastedLoginIp',
    length: 256, 
    nullable: true,
    default: null,
  })
  lastedLoginIp!: string | null;
  @Column({
    type: 'timestamp without time zone', 
    name: 'lastLoginTime',
    nullable: true,
  })
  lastLoginTime!: Date | null;
  @Column({ 
    type: 'enum', 
    name: 'role',
    enumName: 'Role',
    enum: [Role.ADMIN, Role.MEMBER, Role.OPERATOR] ,
    nullable: false,
    default: Role.MEMBER,
  })
  role!: Role;
  @Column({
    type: 'varchar',
    name: 'password',
    length: 300,
    nullable: true,
  })
  password!: string | null;
  @Column({
    type: 'varchar',
    name: 'refreshToken',
    length: 400,
    nullable: true,
  })
  refreshToken!: string|null;
  @CreateDateColumn({
    type: 'timestamp without time zone',
    name: 'createdAt',
    nullable: false,
    default: 'now()'
  })
  createdAt!: Date;
  @UpdateDateColumn({
    type: 'timestamp without time zone',
    name: 'updatedAt',
    nullable: false,
    default: 'now()'
  })
  updatedAt!: Date;
  @DeleteDateColumn({
    type: 'timestamp without time zone',
    name: 'deletedAt',
    nullable: true,
  })
  deletedAt!: Date | null;
  @Column({
    type: 'varchar',
    name: 'updatedBy',
    length: 300,
    nullable: true,
  }) 
  updatedBy!: string | null;
  @Column({
    type: 'varchar',
    name: 'deletedBy',
    length: 300,
    nullable: true,
  }) 
  deletedBy!: string | null;
  // relations
  @OneToOne(
    () => AccountMerkleTreeNode,
    (accountMerkleTreeNode: AccountMerkleTreeNode) => accountMerkleTreeNode.leaf
  )
  accountMerkleTreeNode!: AccountMerkleTreeNode;
  @OneToMany(
    () => AuctionOrderLeafNode,
    (auctionOrderLeafNode:AuctionOrderLeafNode) => auctionOrderLeafNode.L2AddrFromAccount
  )
  fromAuctionOrderLeafNodes!: AuctionOrderLeafNode[];
  @OneToMany(
    () => AuctionOrderLeafNode,
    (auctionOrderLeafNode:AuctionOrderLeafNode) => auctionOrderLeafNode.L2AddrToAccount
  )
  toAuctionOrderLeafNodes!: AuctionOrderLeafNode[];
  @OneToMany(
    () => TransactionInfo,
    (transactionInfo: TransactionInfo) => transactionInfo.L2FromAccountInfo
  )
  fromTransactionInfos!: TransactionInfo[];
  @OneToMany(
    () => TransactionInfo,
    (transactionInfo: TransactionInfo) => transactionInfo.L2ToAccountInfo
  )
  toTransactionInfos!: TransactionInfo[];
  @OneToMany(
    () => AuctionMainOrder,
    (auctionMainOrder: AuctionMainOrder) => auctionMainOrder.L2AddrFromAccount
  )
  fromAuctionMainOrders!: AuctionMainOrder[];
  @OneToMany(
    () => AuctionMainOrder,
    (auctionMainOrder: AuctionMainOrder) => auctionMainOrder.L2AddrToAccount
  )
  toAuctionMainOrders!: AuctionMainOrder[];
  @OneToMany(
    () => AuctionMatchOrder,
    (auctionMatchOrder: AuctionMatchOrder) => auctionMatchOrder.L2AddrFromAccount
  )
  fromAuctionMatchOrders!: AuctionMatchOrder[];
  @OneToMany(
    () => AuctionMatchOrder,
    (auctionMatchOrder: AuctionMatchOrder) => auctionMatchOrder.L2AddrToAccount
  )
  toAuctionMatchOrders!: AuctionMatchOrder[];
}