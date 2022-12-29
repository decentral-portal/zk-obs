import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryColumn } from 'typeorm';
// import { AuctionOrderLeafNode } from '../auctionOrder/auctionOrderLeafNode.entity';
import { ObsOrderEntity } from '../auctionOrder/obsOrder.entity';
import { BaseTimeEntity } from '../common/baseTimeEntity';
import { AccountMerkleTreeNode } from './accountMerkleTreeNode.entity';
import { Role } from './role.enum';
import { TransactionInfo } from './transactionInfo.entity';

@Entity('AccountInformation', { schema: 'public' })
export class AccountInformation extends BaseTimeEntity {
  @PrimaryColumn({
    type: 'varchar', 
    name: 'L1Address', 
    length: 256, 
    primary: true, 
  })
  L1Address!: string;

  @Column({
    type: 'decimal', 
    name: 'accountId',
    precision: 86, 
    scale: 0,
    nullable: false, 
  })
  accountId!: string;
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
  @Column({
    type: 'jsonb',
    name: 'label',
    nullable: true,
    default: () => '\'{}\'',
  })
  label!: object;
  @Column({
    type: 'varchar',
    name: 'labelBy',
    length: 256,
    nullable: true,
  })
  labelBy!: string | null;
  // relations
  @OneToOne(
    () => AccountMerkleTreeNode,
    (accountMerkleTreeNode: AccountMerkleTreeNode) => accountMerkleTreeNode.leaf
  )
  accountMerkleTreeNode!: AccountMerkleTreeNode;
  // @OneToMany(
  //   () => AuctionOrderLeafNode,
  //   (auctionOrderLeafNode:AuctionOrderLeafNode) => auctionOrderLeafNode.L2AddrFromAccount
  // )
  // fromAuctionOrderLeafNodes!: AuctionOrderLeafNode[];
  // @OneToMany(
  //   () => AuctionOrderLeafNode,
  //   (auctionOrderLeafNode:AuctionOrderLeafNode) => auctionOrderLeafNode.L2AddrToAccount
  // )
  // toAuctionOrderLeafNodes!: AuctionOrderLeafNode[];
  @OneToMany(
    () => TransactionInfo,
    (transactionInfo: TransactionInfo) => transactionInfo.L2AccountInfo
  )
  transactionInfos!: TransactionInfo[];
  @OneToMany(
    () => ObsOrderEntity,
    (obsOrder: ObsOrderEntity) => obsOrder.accountInfo
  )
  @JoinColumn({
    name: 'accountId',
    referencedColumnName: 'accountId',
  })
  obsOrders!: ObsOrderEntity[] | null; 
}