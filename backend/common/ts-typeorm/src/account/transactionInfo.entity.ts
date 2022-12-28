import { TsTxType } from '@ts-sdk/domain/lib/ts-types/ts-types';
// import { now } from 'fp-ts/lib/Date';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { BaseTimeEntity } from '../common/baseTimeEntity';
import { AccountInformation } from './accountInformation.entity';
import { BlockInfo } from './blockInfo.entity';
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
  })
  reqType!: TsTxType;
  @Column({
    type: 'decimal',
    name: 'L2AddrFrom',
    precision: 86,
    scale: 0,
    nullable: false,
  })
  L2AddrFrom!: bigint;
  @Column({
    type: 'decimal',
    name: 'L2AddrTo',
    precision: 86,
    scale: 0,
    nullable: false,
  })
  L2AddrTo!: bigint;
  @Column({
    type: 'decimal',
    name: 'L2TokenAddr',
    precision: 86,
    scale: 0,
    nullable: false,
  })
  L2TokenAddr!: bigint;
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
    nullable: false
  })
  nonce!: bigint;
  @Column({
    type: 'decimal',
    name: 'eddsaSig',
    precision: 86,
    scale: 0,
    nullable: false,
  })
  eddsaSig!: bigint;
  @Column({
    type: 'decimal',
    name: 'ecdsaSig',
    precision: 86,
    scale: 0,
    nullable: false,
  })
  ecdsaSig!: bigint;
  @Column({
    type: 'decimal',
    name: 'arg0',
    precision: 86,
    scale: 0,
    nullable: true,
  })
  arg0!: string | null;
  @Column({
    type: 'decimal',
    name: 'arg1',
    precision: 86,
    scale: 0,
    nullable: true,
  })
  arg1!: string | null;
  @Column({
    type: 'decimal',
    name: 'arg2',
    precision: 86,
    scale: 0,
    nullable: true,
  })
  arg2!: string | null;
  @Column({
    type: 'decimal',
    name: 'arg3',
    precision: 86,
    scale: 0,
    nullable: true,
  })
  arg3!: string | null;
  @Column({
    type: 'decimal',
    name: 'arg4',
    precision: 86,
    scale: 0,
    nullable: true,
  })
  arg4!: string | null;
  @Column({
    type: 'decimal',
    name: 'fee',
    precision: 86,
    scale: 0,
    nullable: false,
    default: 0
  })
  fee!: bigint;
  @Column({
    type: 'decimal',
    name: 'feeToken',
    precision: 86,
    scale: 0,
    nullable: false,
    default: 0
  })
  feeToken!: bigint;
  @Column({
    type: 'json',
    name: 'metadata',
    nullable: true,
    default: () => {}
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
    default: TS_STATUS.PENDING
  })
  tsStatus!: TS_STATUS;
  @ManyToOne(
    () => AccountInformation,
    (accountInformation: AccountInformation) => accountInformation.fromTransactionInfos,
    { onDelete: 'RESTRICT', onUpdate: 'CASCADE' }
  )
  @JoinColumn({
    name: 'L2AddrFrom',
    referencedColumnName: 'L2Address'
  })
  L2FromAccountInfo!: AccountInformation;
  @ManyToOne(
    () => AccountInformation,
    (accountInformation: AccountInformation) => accountInformation.toTransactionInfos,
    { onDelete: 'RESTRICT', onUpdate: 'CASCADE' }
  )
  @JoinColumn({
    name: 'L2AddrTo',
    referencedColumnName: 'L2Address'
  })
  L2ToAccountInfo!: AccountInformation;
  @ManyToOne(
    () => BlockInfo,
    (blockInfo: BlockInfo) => blockInfo.transactionInfos,
    { onDelete: 'RESTRICT', onUpdate: 'CASCADE' } 
  )
  @JoinColumn({
    name: 'blockNumber',
    referencedColumnName: 'blockId'
  })
  blockInfo!: BlockInfo;
}