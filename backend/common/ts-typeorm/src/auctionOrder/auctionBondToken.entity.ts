import { TsTokenAddress } from '@ts-sdk/domain/lib/ts-types/ts-types';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export enum BondTokenStatusIndex {
  isL1Deployed = 1,
  isAvailable = 2,
  isExcceeded = 4,
}

@Entity('AuctionBondToken', { schema: 'public'}) 
export class AuctionBondTokenEntity {
  @PrimaryGeneratedColumn({
    type: 'integer',
    name: 'bondId',
  })
  bondId!: number;

  @Column({
    type: 'varchar',
    name: 'L1Addr',
    nullable: true,
    length: 256,
  })
  L1Addr?: string;

  @Column({
    type: 'decimal',
    name: 'L2Addr',
    precision: 86,
    scale: 0,
    nullable: false,
  })
  L2Addr!: TsTokenAddress;

  @Column({
    type: 'decimal',
    name: 'underlyingToken',
    precision: 86,
    scale: 0,
    nullable: false,
  })
  underlyingToken!: TsTokenAddress;
  @Column({
    type: 'integer',
    name: 'lastSyncBlocknumberForDepositEvent',
    default: 0,
    nullable: false,
  })
  lastSyncBlocknumberForDepositEvent!: number;
  @Column({
    type: 'timestamp without time zone',
    name: 'maturityDate',
    nullable: false,
  })
  maturityDate!: Date;

  @Column({
    type: 'integer',
    name: 'status',
    nullable: false,
    default: () => 0,
  })
  status!: number;
  getStatus(statusId: BondTokenStatusIndex): BondTokenStatusIndex {
    return this.status & statusId;
  }
  setStatus(statusId: BondTokenStatusIndex): void {
    this.status |= statusId;
  }

  @CreateDateColumn({
    type: 'timestamp without time zone',
    name: 'createdAt',
    nullable: false,
    default: 'now()',
  })
  createdAt!: Date;
  @UpdateDateColumn({
    type: 'time without time zone',
    name: 'updatedAt',
    nullable: false,
    default: 'now()',
  })
  updatedAt!: Date;
  @Column({
    type: 'varchar',
    name: 'updatedBy',
    nullable: true,
    length: 256,
  })
  updatedBy!: string | null;
  @Column({
    type: 'varchar',
    name: 'deletedBy',
    nullable: true,
    length: 256,
  })
  deletedBy!: string | null;
}