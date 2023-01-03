import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('CandleStick', {schema: 'public'})
export class CandleStickEntity {
  @PrimaryGeneratedColumn({
    type: 'integer',
    name: 'id'
  })
  id!: number;
  @Column({
    type: 'timestamp without time zone',
    name: 'timestamp',
    precision: 3,
    nullable: false,
    default: 'now()'
  })
  timestamp!: Date;
  @Column({
    type: 'varchar',
    name: 'maxPrice',
    length: '300',
    nullable: false,
    default: '0'
  })
  maxPrice!: string;
  @Column({
    type: 'varchar',
    name: 'minPrice',
    length: '300',
    nullable: false,
    default: '0'
  })
  minPrice!: string;
  @Column({
    type: 'varchar',
    name: 'openPrice',
    length: '300',
    nullable: false,
    default: '0'
  })
  openPrice!: string;
  @Column({
    type: 'varchar',
    name: 'closePrice',
    length: '300',
    nullable: false,
    default: '0'
  })
  closePrice!: string;
  @Column({
    type: 'varchar',
    name: 'volume',
    length: '300',
    nullable: false,
    default: '0'
  })
  volume!: string;
  @Column({
    type: 'varchar',
    name: 'marketPair',
    length: '300',
    nullable: false,
    default: '\'ETH/USDC\''
  })
  marketPair!: string;
}