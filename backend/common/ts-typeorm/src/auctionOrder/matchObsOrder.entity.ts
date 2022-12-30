import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { TransactionInfo } from '../account/transactionInfo.entity';
import { TsTxType } from './dto/tsTxType.enum';
import { ObsOrderEntity } from './obsOrder.entity';
import { TsSide } from './tsSide.enum';

@Entity('MatchObsOrder', { schema: 'public'})
export class MatchObsOrderEntity {
  @PrimaryGeneratedColumn({
    type: 'integer',
    name: 'id'
  })
  id!: number;
  @Column({
    type: 'enum',
    name: 'side',
    enumName: 'SIDE',
    enum: [
      TsSide.BUY,
      TsSide.SELL
    ],
    default: () => `'${TsSide.BUY}'`,
    nullable: false,
  })
  side!: TsSide;
  @Column({
    type: 'integer',
    name: 'txId',
    nullable: true,
  })
  txId!: number | null;
  @Column({
    type: 'integer',
    name: 'txId2',
    nullable: true,
  })
  txId2!: number | null;
  @Column({
    type: 'integer',
    name: 'referenceOrder',
    nullable: false,
  })
  referenceOrder!: number;
  @Column({
    type: 'integer',
    name: 'reqType',
    nullable: false,
    default: 0,
  })
  reqType!: number; 
  @Column({
    type: 'varchar',
    name: 'marketPair',
    length: 100,
    default: `'ETH/USDC'`,
    nullable: false
  })
  marketPair!: string;
  @Column({
    type: 'decimal',
    name: 'matchedMQ',
    precision: 86,
    scale: 0,
    default: 0n,
  })
  matchedMQ!: bigint;
  @Column({
    type: 'decimal',
    name: 'matchedBQ',
    precision: 86,
    scale: 0,
    default: 0n
  })
  matchedBQ!: bigint;
  @Column({
    type: 'timestamp without time zone',
    name: 'timestamp',
    precision: 3,
    nullable: false,
    default: 'now()'
  })
  timestamp!: Date;
  @Column({
    type: 'integer',
    name: 'orderStatus',
    default: 1,
  }) 
  orderStatus!: number;
  @Column({
    type: 'boolean',
    name: 'isVoid',
    default: 1,
  }) 
  isVoid!: boolean;
  @Column({
    type: 'boolean',
    name: 'isCancel',
    default: 1,
  }) 
  isCancel!: boolean;
  @ManyToOne(
    () => ObsOrderEntity,
    (obsOrder: ObsOrderEntity) => obsOrder.matchOrders,
    {
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    } 
  )
  @JoinColumn({
    name: 'referenceOrder',
    referencedColumnName: 'id',
  })
  mainOrder!: ObsOrderEntity;
  @OneToOne(
    () => TransactionInfo,
    (transaction: TransactionInfo) => transaction.matchedOrder,
    {
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE'
    }
  )
  @JoinColumn({
    name: 'txId',
    referencedColumnName: 'txId'   
  })
  matchedTx!: TransactionInfo | null;
  @OneToOne(
    () => TransactionInfo,
    (transaction: TransactionInfo) => transaction.matchedOrder2,
    {
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE'
    }
  )
  @JoinColumn({
    name: 'txId2',
    referencedColumnName: 'txId'   
  })
  matchedTx2!: TransactionInfo | null;
}
