import { now } from 'lodash';
import { getProcessName } from '../../../../ts-sdk/src/helper';
import {
  BeforeInsert,
  BeforeRemove,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('RollupInformation', { schema: 'public' })
export class RollupInformation {
  @PrimaryColumn({
    type: 'integer',
    name: 'id',
    primary: true,
    nullable: false,
    generated: 'increment',
  })
  id!: number;

  @Column({
    type: 'integer',
    name: 'lastSyncBlocknumberForRegisterEvent',
    nullable: false,
  })
  lastSyncBlocknumberForRegisterEvent!: number;

  @Column({
    type: 'integer',
    name: 'lastSyncBlocknumberForDepositEvent',
    nullable: false,
  })
  lastSyncBlocknumberForDepositEvent!: number;

  @Column({
    type: 'decimal',
    name: 'currentOrderId',
    precision: 86,
    scale: 0,
    nullable: false,
    default: '0',
  })
  currentOrderId!: string;

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
    default: now(),
  })
  updatedAt!: Date;
  @DeleteDateColumn({
    type: 'timestamp without time zone',
    name: 'deletedAt',
    nullable: true,
  })
  deletedAt!: Date;
  @Column({
    type: 'varchar',
    name: 'updatedBy',
    length: 256,
    nullable: false,
  })
  updatedBy!: string | null;
  @Column({
    type: 'varchar',
    name: 'deletedBy',
    length: 256,
    nullable: true,
  })
  deletedBy!: string | null;

  @BeforeInsert()
  @BeforeUpdate()
  setUpdatedBy() {
    this.updatedBy = getProcessName();
  }

  @BeforeRemove()
  setDeletedBy() {
    this.deletedBy = getProcessName();
  }
}
