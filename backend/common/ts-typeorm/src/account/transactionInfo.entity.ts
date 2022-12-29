import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryColumn } from 'typeorm';
import { MatchObsOrderEntity } from '../auctionOrder/matchObsOrder.entity';
import { BaseTimeEntity } from '../common/baseTimeEntity';
import { AccountInformation } from './accountInformation.entity';
import { BlockInformation } from './blockInformation.entity';
import { TS_STATUS } from './tsStatus.enum';

@Entity('TransactionInfo', { schema: 'public' })
export class TransactionInfo extends BaseTimeEntity {
  @PrimaryColumn({
    type: 'integer',
    name: 'txId',
    primary: true,
    nullable: false,
    generated: 'increment'
  })
  txId!: number;
  @Column({
    type: 'integer',
    name: 'blockNumber',
    nullable: true,
  })
  blockNumber!: number;
  @Column({
    type: 'integer',
    name: 'reqType',
    nullable: false,
    default: 0
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
    type: 'decimal',
    name: 'tokenId',
    precision: 86,
    scale: 0,
    nullable: false,
    default: 0n,
  })
  tokenId!: bigint;
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
    type: 'decimal',
    name: 'amount',
    precision: 86,
    scale: 0,
    nullable: false
  })
  amount!: bigint;
  @Column({
    type: 'decimal',
    name: 'nonce',
    precision: 86,
    scale: 0,
    nullable: false,
    default: 0n,
  })
  nonce!: bigint;
  @Column({
    type: 'decimal',
    name: 'eddsaSig',
    precision: 86,
    scale: 0,
    nullable: false,
    default: 0n,
  })
  eddsaSig!: bigint;
  @Column({
    type: 'decimal',
    name: 'ecdsaSig',
    precision: 86,
    scale: 0,
    nullable: false,
    default: 0n,
  })
  ecdsaSig!: bigint;
  @Column({
    type: 'decimal',
    name: 'arg0',
    precision: 86,
    scale: 0,
    nullable: true,
    default: 0n,
  })
  arg0!: string | null;
  @Column({
    type: 'decimal',
    name: 'arg1',
    precision: 86,
    scale: 0,
    nullable: true,
    default: 0n,
  })
  arg1!: string | null;
  @Column({
    type: 'decimal',
    name: 'arg2',
    precision: 86,
    scale: 0,
    nullable: true,
    default: 0n,
  })
  arg2!: string | null;
  @Column({
    type: 'decimal',
    name: 'arg3',
    precision: 86,
    scale: 0,
    nullable: true,
    default: 0n,
  })
  arg3!: string | null;
  @Column({
    type: 'decimal',
    name: 'arg4',
    precision: 86,
    scale: 0,
    nullable: true,
    default: 0n,
  })
  arg4!: string | null;
  @Column({
    type: 'decimal',
    name: 'fee',
    precision: 86,
    scale: 0,
    nullable: false,
    default: 0n
  })
  fee!: bigint;
  @Column({
    type: 'decimal',
    name: 'feeToken',
    precision: 86,
    scale: 0,
    nullable: false,
    default: 0n
  })
  feeToken!: bigint;
  @Column({
    type: 'json',
    name: 'metadata',
    nullable: true,
    default: () => '\'{}\''
  })
  metadata!: object | null;
  @Column({
    type: 'enum',
    name: 'tsStatus',
    enum: [
      TS_STATUS.PENDING,
      TS_STATUS.PROCESSING,
      TS_STATUS.L2EXECUTED,
      TS_STATUS.L2CONFIRMED,
      TS_STATUS.L1CONFIRMED,
      TS_STATUS.FAILED,
      TS_STATUS.REJECTED
    ],
    nullable: false,
    default: `'${TS_STATUS.PENDING}'`
  })
  tsStatus!: TS_STATUS;
  @ManyToOne(
    () => AccountInformation,
    (accountInformation: AccountInformation) => accountInformation.transactionInfos,
    { onDelete: 'RESTRICT', onUpdate: 'CASCADE' }
  )
  @JoinColumn({
    name: 'accountId',
    referencedColumnName: 'accountId'
  })
  L2AccountInfo!: AccountInformation;
  @ManyToOne(
    () => BlockInformation,
    (blockInformation: BlockInformation) => blockInformation.transactionInfos,
    { onDelete: 'RESTRICT', onUpdate: 'CASCADE' } 
  )
  @JoinColumn({
    name: 'blockNumber',
    referencedColumnName: 'blockNumber'
  })
  blockInfo!: BlockInformation;
  @OneToOne(
    () => MatchObsOrderEntity,
    (matchedObsOrder: MatchObsOrderEntity) => matchedObsOrder.matchedTx
  )
  @JoinColumn({
    name: 'txId',
    referencedColumnName: 'txId'
  })
  matchedOrder!: MatchObsOrderEntity | null;
  @OneToOne(
    () => MatchObsOrderEntity,
    (matchedObsOrder: MatchObsOrderEntity) => matchedObsOrder.matchedTx2
  )
  @JoinColumn({
    name: 'txId',
    referencedColumnName: 'txId2'
  })
  matchedOrder2!: MatchObsOrderEntity | null;
}