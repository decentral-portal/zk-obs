import { Column, CreateDateColumn, DeleteDateColumn, UpdateDateColumn } from 'typeorm';

export abstract class BaseTimeEntity {
  @CreateDateColumn({
    type: 'timestamp without time zone',
    name: 'createdAt',
    default: () => 'now()',
  })
  createdAt!: Date;
  @Column({
    type: 'varchar',
    name: 'createdBy',
    length: 300,
    nullable: true,
  })
  createdBy!: string | null;
  @UpdateDateColumn({
    type: 'timestamp without time zone',
    name: 'updatedAt',
    default: () => 'now()',
  })
  updatedAt!: Date;
  @Column({
    type: 'varchar',
    name: 'updatedBy',  
    length: 300,  
    nullable: true,
  })
  updatedBy!: string | null; 
  @DeleteDateColumn({
    type: 'timestamp without time zone',
    name: 'deletedAt',
    nullable: true,
  })
  deletedAt!: Date | null;
  @Column({
    type: 'varchar', 
    name: 'deletedBy',
    length: 300,
    nullable: true,
  })
  deletedBy!: string | null;
}