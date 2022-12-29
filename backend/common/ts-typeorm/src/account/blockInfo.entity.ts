import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { BaseTimeEntity } from '../common/baseTimeEntity';
import { TransactionInfo } from './transactionInfo.entity';

@Entity('BlockInfo', { schema: 'public' })
export class BlockInfo extends BaseTimeEntity {
  @PrimaryColumn({
    type: 'integer',
    name: 'blockId',
    primary: true,
  })
  blockId!: number;
  @Column({
    type: 'varchar',
    name: 'blockHash',
    length: 256,
  })
  blockHash!: string;
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
    type: 'integer',
    name: 'blockStatus',
    nullable: false,
    default: 0,
  })
  blockStatus!: number;
  @OneToMany(
    () => TransactionInfo,
    transactionInfo => transactionInfo.blockInfo,
  )
  transactionInfos!: TransactionInfo[];
}