import { matchE } from 'fp-ts/lib/IOEither';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AccountInformation } from '../account/accountInformation.entity';
import { MatchObsOrderEntity } from './matchObsOrder.entity';
import { ObsOrderLeafEntity } from './obsOrderLeaf.entity';
import { TsSide } from './tsSide.enum';

@Entity('ObsOrder', { schema: 'public' })
export class ObsOrderEntity {
  @PrimaryGeneratedColumn({
    type: 'int8',
    name: 'id',
  })
  id!: number;
  @Column({
    type: 'enum',
    name: 'side',
    enumName: 'SIDE',
    enum: [TsSide.BUY, TsSide.SELL],
    nullable: false,
    default: () => `\'${TsSide.BUY}\'`,
  })
  side!: TsSide;
  @Column({
    type: 'int8',
    name: 'txId',
    nullable: false,
    default: 0,
  })
  txId!: number;
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
  accountId!: string;
  @Column({
    type: 'varchar',
    name: 'marketPair',
    length: 100,
    nullable: false,
    default: '\'ETH/USDC\'',
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
  price!: string;

  static ORDER_STATUS_IDX_RUNNING = 1;
  static ORDER_STATUS_IDX_CANCELED = 2;
  static ORDER_STATUS_IDX_VOID = 4;
  @Column({
    type: 'integer',
    name: 'orderStatus',
    nullable: false,
    default: 1,
  })
  orderStatus!: number;
  get isCanceled() {
    return this.orderStatus & ObsOrderEntity.ORDER_STATUS_IDX_CANCELED;
  }

  get isVoid() {
    return this.orderStatus & ObsOrderEntity.ORDER_STATUS_IDX_CANCELED;
  }

  @Column({
    type: 'decimal',
    name: 'mainQty',
    precision: 86,
    scale: 0,
    nullable: false,
    default: 0n,
  })
  mainQty!: string;
  @Column({
    type: 'decimal',
    name: 'baseQty',
    precision: 86,
    scale: 0,
    nullable: false,
    default: 0n,
  })
  baseQty!: string;
  @Column({
    type: 'decimal',
    name: 'remainMainQty',
    precision: 86,
    scale: 0,
    nullable: false,
    default: 0n,
  })
  remainMainQty!: string;
  @Column({
    type: 'decimal',
    name: 'remainBaseQty',
    precision: 86,
    scale: 0,
    nullable: false,
    default: 0n,
  })
  remainBaseQty!: string;
  @Column({
    type: 'decimal',
    name: 'accumulatedMainQty',
    precision: 86,
    scale: 0,
    nullable: false,
    default: 0n,
  })
  accumulatedMainQty!: string;
  @Column({
    type: 'decimal',
    name: 'accumulatedBaseQty',
    precision: 86,
    scale: 0,
    nullable: false,
    default: 0n,
  })
  accumulatedBaseQty!: string;
  @Column({
    type: 'decimal',
    name: 'mainTokenId',
    precision: 86,
    scale: 0,
    nullable: false,
    default: 0,
  })
  mainTokenId!: string;
  @Column({
    type: 'decimal',
    name: 'baseTokenId',
    precision: 86,
    scale: 0,
    nullable: false,
    default: 0,
  })
  baseTokenId!: string;
  @Column({
    type: 'timestamp without time zone',
    name: 'timestamp',
    nullable: false,
    precision: 3,
    default: () => 'now()',
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
    type: 'int8',
    name: 'orderLeafId',
    nullable: true,
    unique: true,
  })
  orderLeafId!: number | null;
  // @OneToOne(
  //   () => ObsOrderLeafEntity,
  //   (obsOrder: ObsOrderLeafEntity ) => obsOrder.obsOrder,
  // )
  // @JoinColumn({
  //   name: 'id',
  //   referencedColumnName: 'orderId'
  // })
  // obsOrderLeaf!: ObsOrderLeafEntity;
  @OneToMany(
    () => MatchObsOrderEntity,
    (matchOrders: MatchObsOrderEntity) => matchOrders.marketPair,
  )
  @JoinColumn({
    name: 'id',
    referencedColumnName: 'referenceOrder',
  })
  matchOrders!: MatchObsOrderEntity[];
  @ManyToOne(
    () => AccountInformation,
    (accountInfo: AccountInformation) => accountInfo.obsOrders,
    {
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    },
  )
  @JoinColumn({
    name: 'accountId',
    referencedColumnName: 'accountId',
  })
  accountInfo!: AccountInformation;
}
