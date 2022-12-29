import { Column, Entity, JoinColumn, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { BaseTimeEntity } from '../common/baseTimeEntity';
import { BLOCK_STATUS } from './blockStatus.enum';
import { TransactionInfo } from './transactionInfo.entity';

@Entity('BlockInformation', { schema: 'public' })
export class BlockInformation extends BaseTimeEntity {
  @PrimaryGeneratedColumn({
    type: 'integer',
    name: 'blockNumber'
  })
  blockNumber!: number;
  @Column({
    type: 'varchar',
    name: 'blockHash',
    length: 256,
    nullable: true,
  })
  blockHash!: string | null;
  @Column({
    type: 'varchar',
    name: 'L1TransactionHash',
    length: 512,
  })
  L1TransactionHash!: string;
  @Column({ 
    type: 'timestamp without time zone',
    name: 'verifiedAt',
    nullable: false,
  })
  verifiedAt!: Date;
  @Column({
    type: 'varchar',  
    name: 'operatorAddress',
    length: 256,
    nullable: false,
  })
  operatorAddress!: string;
  @Column({
    type: 'text',
    name: 'rawData',
    nullable: true,
  })
  rawData!: string | null;
  @Column({
    type: 'json',
    name: 'callData',
    nullable: true,
    default: () => '\'{}\'',
  })
  callData!: object | '{}';
  @Column({
    type: 'json',
    name: 'proof',
    nullable: true,
    default: () => '\'{}\'',
  })
  proof!: object | '{}';
  @Column({
    type: 'enum',
    name: 'blockStatus',
    nullable: false,
    enumName: 'BLOCK_STATUS',
    enum: [
      BLOCK_STATUS.PROCESSING,
      BLOCK_STATUS.L2EXECUTED,
      BLOCK_STATUS.L2CONFIRMED,
      BLOCK_STATUS.L1CONFIRMED
    ],
    default: `'${BLOCK_STATUS.PROCESSING}'`,
  })
  blockStatus!: BLOCK_STATUS;
  @OneToMany(
    () => TransactionInfo,
    transactionInfo => transactionInfo.blockInfo,
  )
  @JoinColumn({
    name: 'blockNumber',
    referencedColumnName: 'blockNumber'
  })
  transactionInfos!: TransactionInfo[] | null;
}