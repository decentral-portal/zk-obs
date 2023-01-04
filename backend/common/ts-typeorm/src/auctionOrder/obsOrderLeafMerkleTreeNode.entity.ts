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
  id!: string;
  @Column({
    type: 'decimal',
    name: 'hash',
    precision: 86,
    scale: 0,
    nullable: false,
    default: 0n,
  })
  hash!: string;
  @Column({
    type: 'decimal',
    name: 'leafId',
    precision: 86,
    scale: 0,
    nullable: true
  })
  leafId!: string | null;
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