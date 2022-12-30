import { matchE } from 'fp-ts/lib/IOEither';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { AccountInformation } from '../account/accountInformation.entity';
import { TsTxType } from '../account/dto/ts-type';
import { MatchObsOrderEntity } from './matchObsOrder.entity';
import { ObsOrderLeafEntity } from './obsOrderLeaf.entity';
import { TsSide } from './tsSide.enum';

@Entity('ObsOrder', { schema: 'public'})
export class ObsOrderEntity {
  @PrimaryGeneratedColumn({
    type: 'integer',
    name: 'id',
  })
  id!: number;
  @Column({
    type: 'enum',
    name: 'side',
    enumName: 'SIDE',
    enum: [
      TsSide.BUY,
      TsSide.SELL,
    ],
    nullable: false,
    default: () => `\'${TsSide.BUY}\'`,
  })
  side!: TsSide;
  @Column({
    type: 'integer',
    name: 'reqType',
    nullable: false,
    default: 0,
  })
  reqType!: number;
  @Column({
    type: 'decimal',
    name: 'accountId',
    precision: 86,
    scale: 0,
    nullable: false,
    default: 0n,
  })
  accountId!: bigint;
  @Column({
    type: 'varchar',
    name: 'marketPair',
    length: 100,
    nullable: false,
    default: `'ETH/USDC'`,
  })
  marketPair!: string;
  @Column({
    type: 'decimal',
    name: 'price',
    precision: 86,
    scale: 8,
    nullable: false,
    default: 0n,
  })
  price!: bigint;
  @Column({
    type: 'integer',
    name: 'orderStatus',
    nullable: false,
    default: 1, // pending=1, canceled=2, matched=3
  })
  orderStatus!: number;
  @Column({
    type: 'decimal',
    name: 'mainQty',
    precision: 86,
    scale: 0,
    nullable: false,
    default: 0n,
  })
  mainQty!: bigint;
  @Column({
    type: 'decimal',
    name: 'baseQty',
    precision: 86,
    scale: 0,
    nullable: false,
    default: 0n,
  })
  baseQty!: bigint;
  @Column({
    type: 'decimal',
    name: 'remainMainQuantity',
    precision: 86,
    scale: 0,
    nullable: false,
    default: 0n,
  })
  remainMQ!: bigint;
  @Column({
    type: 'decimal',
    name: 'remainBaseQuantity',
    precision: 86,
    scale: 0,
    nullable: false,
    default: 0n,
  })
  remainBQ!: bigint;
  @Column({
    type: 'decimal',
    name: 'accumulatedMainQty',
    precision: 86,
    scale: 0,
    nullable: false,
    default: 0n,
  })
  accumulatedMainQty!: bigint;
  @Column({
    type: 'decimal',
    name: 'accumulatedBaseQty',
    precision: 86,
    scale: 0,
    nullable: false,
    default: 0n,
  })
  accumulatedBaseQty!: bigint;
  @Column({
    type: 'integer',
    name: 'mainTokenId',
    nullable: false,
    default: 0,
  })
  mainTokenId!: number;
  @Column({
    type: 'integer',
    name: 'baseTokenId',
    nullable: false,
    default: 0,
  })
  baseTokenId!: number;
  @Column({
    type: 'timestamp without time zone',
    name: 'timestamp',
    nullable: false,
    precision: 3,
    default: () => `now()`,
  })
  timestamp!: Date;
  @Column({
    type: 'boolean',
    name: 'isMaker',
    nullable: false,
    default: false, 
  })
  isMaker!: boolean;
  @Column({
    type: 'integer',
    name: 'orderLeafId',
    nullable: true,
    unique: true,
  })
  orderLeafId!: number | null;
  @OneToOne(
    () => ObsOrderLeafEntity,
    (obsOrder: ObsOrderLeafEntity ) => obsOrder.obsOrder,
  )
  @JoinColumn({
    name: 'id',
    referencedColumnName: 'orderId'
  })
  obsOrderLeaf!: ObsOrderLeafEntity;
  @OneToMany(
    () => MatchObsOrderEntity,
    (matchOrders: MatchObsOrderEntity) => matchOrders.marketPair
  )
  @JoinColumn({
    name: 'id',
    referencedColumnName: 'referenceOrder'
  })
  matchOrders!: MatchObsOrderEntity[];
  @ManyToOne(
    () => AccountInformation,
    (accountInfo: AccountInformation) => accountInfo.obsOrders,
    {
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE'
    }
  )
  @JoinColumn({
    name: 'accountId',
    referencedColumnName: 'accountId'
  })
  accountInfo!: AccountInformation; 
}