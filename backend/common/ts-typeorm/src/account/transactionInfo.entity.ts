import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';
import { MatchObsOrderEntity } from '../auctionOrder/matchObsOrder.entity';
import { BaseTimeEntity } from '../common/baseTimeEntity';
import { AccountInformation } from './accountInformation.entity';
import { BlockInformation } from './blockInformation.entity';
import { TS_STATUS } from './tsStatus.enum';
import { TsTokenAddress } from '../../../../ts-sdk/src/domain/lib/ts-types/ts-types';

@Entity('TransactionInfo', { schema: 'public' })
export class TransactionInfo extends BaseTimeEntity {
  @PrimaryColumn({
    type: 'integer',
    name: 'txId',
    primary: true,
    nullable: false,
    generated: 'increment',
  })
  txId!: number;
  @Column({
    type: 'integer',
    name: 'blockNumber',
    nullable: true,
    default: 0,
  })
  blockNumber!: number | null;
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
    type: 'decimal',
    name: 'tokenId',
    precision: 86,
    scale: 0,
    nullable: false,
    default: 0n,
  })
  tokenId!: string;
  @Column({
    type: 'decimal',
    name: 'accumulatedSellAmt',
    precision: 86,
    scale: 0,
    nullable: false,
    default: 0n,
  })
  accumulatedSellAmt!: string;
  @Column({
    type: 'decimal',
    name: 'accumulatedBuyAmt',
    precision: 86,
    scale: 0,
    nullable: false,
    default: 0n,
  })
  accumulatedBuyAmt!: string;
  @Column({
    type: 'decimal',
    name: 'amount',
    precision: 86,
    scale: 0,
    nullable: false,
    default: 0n,
  })
  amount!: string;
  @Column({
    type: 'decimal',
    name: 'nonce',
    precision: 86,
    scale: 0,
    nullable: false,
    default: 0n,
  })
  nonce!: string;
  @Column({
    type: 'json',
    name: 'eddsaSig',
    nullable: false,
    default: () => JSON.stringify({ R8: ['0', '0'], S: '0' }),
  })
  eddsaSig!: {
    R8: [string, string];
    S: string;
  };
  @Column({
    type: 'varchar',
    name: 'ecdsaSig',
    length: '66',
    nullable: false,
    default: '\'\'',
  })
  ecdsaSig!: string;
  @Column({
    type: 'decimal',
    name: 'arg0',
    precision: 86,
    scale: 0,
    nullable: false,
    default: 0n,
  })
  arg0!: string;
  @Column({
    type: 'decimal',
    name: 'arg1',
    precision: 86,
    scale: 0,
    nullable: false,
    default: 0n,
  })
  arg1!: string;
  @Column({
    type: 'decimal',
    name: 'arg2',
    precision: 86,
    scale: 0,
    nullable: false,
    default: 0n,
  })
  arg2!: string;
  @Column({
    type: 'decimal',
    name: 'arg3',
    precision: 86,
    scale: 0,
    nullable: false,
    default: 0n,
  })
  arg3!: string;
  @Column({
    type: 'decimal',
    name: 'arg4',
    precision: 86,
    scale: 0,
    nullable: false,
    default: 0n,
  })
  arg4!: string;
  @Column({
    type: 'varchar',
    name: 'tsPubKeyX',
    length: '100',
    nullable: false,
    default: '\'0\'',
  })
  tsPubKeyX!: string;
  @Column({
    type: 'varchar',
    name: 'tsPubKeyY',
    length: '100',
    nullable: false,
    default: '\'0\'',
  })
  tsPubKeyY!: string;
  @Column({
    type: 'decimal',
    name: 'fee',
    precision: 86,
    scale: 0,
    nullable: false,
    default: 0n,
  })
  fee!: string;
  @Column({
    type: 'decimal',
    name: 'feeToken',
    precision: 86,
    scale: 0,
    nullable: false,
    default: 0n,
  })
  feeToken!: string;
  @Column({
    type: 'json',
    name: 'metadata',
    nullable: false,
    default: () => '\'{}\'',
  })
  metadata!: {
    accumalatedSellAmt: string,
    accumalatedBuyAmt: string,
    lendingCumAmt: string,
    bondCumAmt: string,
  } | null;
  @Column({
    type: 'enum',
    name: 'txStatus',
    enum: [
      TS_STATUS.PENDING,
      TS_STATUS.PROCESSING,
      TS_STATUS.L2EXECUTED,
      TS_STATUS.L2CONFIRMED,
      TS_STATUS.L1CONFIRMED,
      TS_STATUS.FAILED,
      TS_STATUS.REJECTED,
    ],
    nullable: false,
    default: `'${TS_STATUS.PENDING}'`,
  })
  txStatus!: TS_STATUS;

  @Column({
    type: 'varchar',
    name: 'L1TxHash',
    length: '100',
    nullable: true
  })
  L1TxHash?: string;

  @ManyToOne(
    () => AccountInformation,
    (accountInformation: AccountInformation) =>
      accountInformation.transactionInfos,
    {
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    },
  )
  @JoinColumn({
    name: 'accountId',
    referencedColumnName: 'accountId',
  })
  L2AccountInfo!: AccountInformation;
  @ManyToOne(
    () => BlockInformation,
    (blockInformation: BlockInformation) => blockInformation.transactionInfos,
    {
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    },
  )
  @JoinColumn({
    name: 'blockNumber',
    referencedColumnName: 'blockNumber',
  })
  blockInfo!: BlockInformation;
  @OneToOne(
    () => MatchObsOrderEntity,
    (matchedObsOrder: MatchObsOrderEntity) => matchedObsOrder.matchedTx,
  )
  @JoinColumn({
    name: 'txId',
    referencedColumnName: 'txId',
  })
  matchedOrder!: MatchObsOrderEntity | null;
  get tokenAddr(): TsTokenAddress {
    return this.tokenId.toString() as TsTokenAddress;
  }
  // @OneToOne(() => MatchObsOrderEntity, (matchedObsOrder: MatchObsOrderEntity) => matchedObsOrder.matchedTx2)
  // @JoinColumn({
  //   name: 'txId',
  //   referencedColumnName: 'txId2',
  // })
  // matchedOrder2!: MatchObsOrderEntity | null;
}
