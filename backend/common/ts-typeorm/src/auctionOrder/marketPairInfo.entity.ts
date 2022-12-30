import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('MarketPairInfo', {schema: 'public'})
export class MarketPairInfoEntity {
  @PrimaryGeneratedColumn({
    type: 'integer',
    name: 'id'
  })
  id!: number;
  @Column({
    type: 'decimal',
    name: 'mainTokenId',
    precision: 86,
    scale: 0,
    default: 0n,
    nullable: false
  })
  mainTokenId!: string;
  @Column({
    type: 'decimal',
    name: 'baseTokenId',
    precision: 86,
    scale: 0,
    default: 0n,
    nullable: false
  })
  baseTokenId!: string;
  @Column({
    type: 'varchar',
    name: 'marketPair',
    length: '100',
    nullable: false,
    default: () => 'ETH/USDC'
  })
  marketPair!: string;
}