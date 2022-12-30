import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { ObsOrderEntity } from './obsOrder.entity';
import { ObsOrderLeafEntity } from './obsOrderLeaf.entity';

@Entity('ObsOrderLeafMerkleTreeNode', { schema: 'public' }) 
export class ObsOrderLeafMerkleTreeNode {
  @PrimaryColumn({
    type: 'decimal',
    name: 'id',
    precision: 86,
    scale: 0,
    primary: true,
  })
  id!: bigint;
  @Column({
    type: 'decimal',
    name: 'hash',
    precision: 86,
    scale: 0,
    nullable: false,
    default: 0n,
  })
  hash!: bigint;
  @Column({
    type: 'decimal',
    name: 'leafId',
    precision: 86,
    scale: 0,
    nullable: true
  })
  leafId!: bigint | null;
  @OneToOne(
    () => ObsOrderLeafEntity,
    (obsOrderLeaf: ObsOrderLeafEntity) => obsOrderLeaf.merkleTreeNode,
  )
  @JoinColumn({
    name: 'leafId',
    referencedColumnName: 'orderLeafId'
  })
  leaf!: ObsOrderLeafEntity | null;
}