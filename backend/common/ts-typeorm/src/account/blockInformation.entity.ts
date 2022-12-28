// import { now } from 'fp-ts/lib/Date';
import { Column, CreateDateColumn, DeleteDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { TS_STATUS } from './tsStatus.enum';

export enum CircuitName {
  REGISTER = 'REGISTER',
  NORMAL = 'NORMAL',
  AUCTION_MATCH = 'AUCTION_MATCH',
  SECONDARY_MATCH = 'SECONDARY_MATCH',
  REPO_MATCH = 'REPO_MATCH',
}

@Index('BlockInfomation_pkey',['blockNumber',],{ unique:true })
@Entity('BlockInformation' ,{schema:'public' } )
export class BlockInfomation {
  
  @PrimaryGeneratedColumn({ type:'integer', name:'blockNumber' })
  blockNumber!:number;

  @Column('enum',{ name:'name',enum:[CircuitName.REGISTER, CircuitName.NORMAL, CircuitName.AUCTION_MATCH, CircuitName.SECONDARY_MATCH, CircuitName.REPO_MATCH]})
  name!: CircuitName;

  @Column('integer',{ name:'startTxId',default: () => '0', })
  startTxId!:number;

  @Column('integer',{ name:'endTxId',default: () => '0', })
  endTxId!:number;

  @Column({
    type: 'enum',
    name: 'status',
    enumName: 'TS_STATUS',
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
  status!: TS_STATUS;

  @Column('json',{ name:'circuitInput' })
  circuitInput!:object;

  @Column('json',{ name:'proof' })
  proof!:object;

  @Column('json',{ name:'publicInput' })
  publicInput!:object;

  @CreateDateColumn({
    type: 'timestamp without time zone',
    name: 'createdAt',
    nullable: false,
    default: 'now()',
  })
  createdAt!: Date;
  @UpdateDateColumn({
    type: 'timestamp without time zone',
    name: 'updatedAt',
    nullable: false,
    default: 'now()'
  })
  updatedAt!: Date;
  @DeleteDateColumn({
    type: 'timestamp without time zone',
    name: 'deletedAt',
    nullable: true
  })
  deletedAt!: Date;
  @Column({
    type: 'varchar',
    name: 'updatedBy',
    length: 256,
    nullable: true,
  })
  updatedBy!: string | null;
  @Column({
    type: 'varchar',
    name: 'deletedBy',
    length: 256,
    nullable: true,
  })
  deletedBy!: string | null;
}