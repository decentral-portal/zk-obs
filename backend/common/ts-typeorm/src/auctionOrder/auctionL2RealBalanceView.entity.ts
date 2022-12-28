import { Column, PrimaryColumn, ViewEntity } from 'typeorm';

@ViewEntity({
  name: 'AuctionL2RealBalanceView',
  expression: `
SELECT 
  tln."L2Address" AS "L2Address",
  tln."L2TokenAddr" AS "L2TokenAddr",
  tln."lockedAmt" + arov."lendingAmt"  + arov."collateralAmt"  AS "lockedAmt",
  tln."availableAmt"  - arov."lendingAmt"  - arov."collateralAmt" AS "availableAmt"
FROM "TokenLeafNode" tln JOIN "AuctionRemainOrderView" arov 
ON tln."L2Address" = arov."L2AddrFrom" AND tln."L2TokenAddr" = arov."L2TokenAddrTSL";`,
  schema: 'public'
})
export class AuctionL2RealBalanceViewEntity {
  @PrimaryColumn({
    name: 'L2Address',
    type: 'decimal',
    precision: 86,
    scale: 0,
    primary: true
  })
  L2Address!: string
  @PrimaryColumn({
    name: 'L2TokenAddr',
    type: 'decimal',
    precision: 86,
    scale: 0,
    primary: true
  })
  L2TokenAddr!: string
  @Column({
    name: 'lockedAmt',
    type: 'decimal',
    precision: 86,
    scale: 0,
    nullable: false,
  })
  lockedAmt!: bigint;
  @Column({
    name: 'availableAmt',
    type: 'decimal',
    precision: 86,
    scale: 0,
    nullable: false,
  })
  availableAmt!: bigint;
}