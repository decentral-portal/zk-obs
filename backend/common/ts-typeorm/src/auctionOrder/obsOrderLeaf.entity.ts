import { ObsOrderLeafEncodeType } from '@ts-sdk/domain/lib/ts-types/ts-types';
import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';
import { ObsOrderEntity } from './obsOrder.entity';
import { ObsOrderLeafMerkleTreeNode } from './obsOrderLeafMerkleTreeNode.entity';
import { toTreeLeaf } from '../../../../ts-sdk/src/domain/lib/ts-rollup/ts-helper';
import { UpdateObsOrderTreeDto } from './dto/updateObsOrderTree.dto';

@Entity('ObsOrderLeaf', { schema: 'public' })
export class ObsOrderLeafEntity {
  @PrimaryColumn({
    type: 'decimal',
    name: 'orderLeafId',
    precision: 86,
    scale: 0,
    nullable: false,
    default: 0n,
  })
  orderLeafId!: string;
  @Column({
    type: 'int8',
    name: 'txId',
    nullable: true,
  })
  txId!: number | null;
  @Column({
    type: 'integer',
    name: 'reqType',
    nullable: false,
    default: 0,
  })
  reqType!: number;
  @Column({
    type: 'decimal',
    name: 'sender',
    precision: 86,
    scale: 0,
    nullable: false,
    default: 0n,
  })
  sender!: string;
  @Column({
    type: 'decimal',
    name: 'sellTokenId',
    precision: 86,
    scale: 0,
    nullable: false,
    default: 0n,
  })
  sellTokenId!: string;
  @Column({
    type: 'decimal',
    name: 'sellAmt',
    precision: 86,
    scale: 0,
    nullable: false,
    default: 0n,
  })
  sellAmt!: string;
  @Column({
    type: 'decimal',
    name: 'nonce',
    precision: 86,
    scale: 0,
    nullable: false,
    default: 0n,
  })
  nonce!: string;
  @Column({
    type: 'decimal',
    name: 'buyTokenId',
    precision: 86,
    scale: 0,
    nullable: false,
    default: 0n,
  })
  buyTokenId!: string;
  @Column({
    type: 'decimal',
    name: 'buyAmt',
    precision: 86,
    scale: 0,
    nullable: false,
    default: 0n,
  })
  buyAmt!: string;
  @Column({
    type: 'decimal',
    name: 'accumulatedSellAmt',
    precision: 86,
    scale: 0,
    nullable: false,
    default: 0n,
  })
  accumulatedSellAmt!: string;
  @Column({
    type: 'decimal',
    name: 'accumulatedBuyAmt',
    precision: 86,
    scale: 0,
    nullable: false,
    default: 0n,
  })
  accumulatedBuyAmt!: string;
  // @Column({
  //   type: 'int8',
  //   name: 'orderId',
  //   nullable: false,
  //   default: 0,
  // })
  // orderId!: number;
  // @OneToOne(() => ObsOrderEntity, (obsOrder) => obsOrder.obsOrderLeaf, {
  //   onDelete: 'RESTRICT',
  //   onUpdate: 'CASCADE',
  // })
  // @JoinColumn({
  //   name: 'orderId',
  //   referencedColumnName: 'id',
  // })
  // obsOrder!: ObsOrderEntity;
  @OneToOne(() => ObsOrderLeafMerkleTreeNode, (obsOrderLeafMerkleTreeNode: ObsOrderLeafMerkleTreeNode) => obsOrderLeafMerkleTreeNode.leaf, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({
    name: 'orderLeafId',
    referencedColumnName: 'leafId',
  })
  merkleTreeNode!: ObsOrderLeafMerkleTreeNode;

  encode(): ObsOrderLeafEncodeType {
    return [
      BigInt(this.reqType),
      BigInt(this.sender),
      BigInt(this.sellTokenId),
      BigInt(this.sellAmt),
      BigInt(this.nonce),
      0n,
      0n,
      BigInt(this.buyTokenId),
      BigInt(this.buyAmt),
      0n,
      BigInt(this.txId || 0),
      BigInt(this.accumulatedSellAmt),
      BigInt(this.accumulatedBuyAmt),
    ];
  }
  encodeLeaf() {
    return toTreeLeaf(this.encode());
  }

  convertToObsOrderDto(): UpdateObsOrderTreeDto {
    return {
      orderLeafId: this.orderLeafId,
      txId: String(this.txId) || '0',
      reqType: this.reqType.toString(),
      sender: this.sender,
      sellTokenId: this.sellTokenId,
      nonce: this.nonce,
      sellAmt: this.sellAmt,
      buyTokenId: this.buyTokenId,
      buyAmt: this.buyAmt,
      accumulatedSellAmt: this.accumulatedSellAmt,
      accumulatedBuyAmt: this.accumulatedBuyAmt,
    // orderId!: string;
    };
  }
}
