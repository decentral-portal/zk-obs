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
    default: `'ETH-USDC'`,
  })
  marketPair!: string;
  @Column({
    type: 'decimal',
    name: 'price',
    precision: 86,
    scale: 0,
    nullable: false,
    default: 0n,
  })
  price!: bigint;
  @Column({
    type: 'integer',
    name: 'orderStatus',
    nullable: false,
    default: 0, // pending=0, canceled=1, matched=2
  })
  orderStatus!: number;
  @Column({
    type: 'decimal',
    name: 'mainQuantity',
    precision: 86,
    scale: 0,
    nullable: false,
    default: 0n,
  })
  mainQuantity!: bigint;
  @Column({
    type: 'decimal',
    name: 'baseQuantity',
    precision: 86,
    scale: 0,
    nullable: false,
    default: 0n,
  })
  baseQuantity!: bigint;
  @Column({
    type: 'decimal',
    name: 'remainMQ',
    precision: 86,
    scale: 0,
    nullable: false,
    default: 0n,
  })
  remainMQ!: bigint;
  @Column({
    type: 'decimal',
    name: 'remainBQ',
    precision: 86,
    scale: 0,
    nullable: false,
    default: 0n,
  })
  remainBQ!: bigint;
  @Column({
    type: 'decimal',
    name: 'accumulatedSellAmt',
    precision: 86,
    scale: 0,
    nullable: false,
    default: 0n,
  })
  accumulatedSellAmt!: bigint;
  @Column({
    type: 'decimal',
    name: 'accumulatedBuyAmt',
    precision: 86,
    scale: 0,
    nullable: false,
    default: 0n,
  })
  accumulatedBuyAmt!: bigint;
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