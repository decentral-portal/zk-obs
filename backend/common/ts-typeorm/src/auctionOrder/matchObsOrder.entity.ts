import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { TransactionInfo } from '../account/transactionInfo.entity';
import { TsTxType } from './dto/tsTxType.enum';
import { ObsOrderEntity } from './obsOrder.entity';
import { TsSide } from './tsSide.enum';

@Entity('MatchObsOrder', { schema: 'public'})
export class MatchObsOrderEntity {
  @PrimaryGeneratedColumn({
    type: 'int8',
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
    type: 'int8',
    name: 'txId',
    nullable: true,
  })
  txId!: number | null;
  @Column({
    type: 'int8',
    name: 'txId2',
    nullable: true,
  })
  txId2!: number | null;
  @Column({
    type: 'int8',
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
    default: '\'ETH/USDC\'',
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
  matchedMQ!: string;
  @Column({
    type: 'decimal',
    name: 'matchedBQ',
    precision: 86,
    scale: 0,
    default: 0n
  })
  matchedBQ!: string;
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
    default: false,
  }) 
  isVoid!: boolean;
  @Column({
    type: 'boolean',
    name: 'isCancel',
    default: false,
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
  // @OneToOne(
  //   () => TransactionInfo,
  //   (transaction: TransactionInfo) => transaction.matchedOrder2,
  // )
  // @JoinColumn({
  //   name: 'txId2',
  //   referencedColumnName: 'txId'   
  // })
  // matchedTx2!: TransactionInfo | null;
}
