import { string } from 'io-ts';
import { Column, PrimaryColumn, ViewEntity } from 'typeorm';

@ViewEntity('AvailableView', {
  schema: 'public',
  expression: `
SELECT 
  "tokenleaf"."accountId",
  "pendingOrder"."tokenId",
  ("tokenleaf"."lockedAmt" +  "pendingOrder"."sellAmt") AS "lockedAmt",
  ("tokenleaf"."availableAmt" - "pendingOrder"."sellAmt") AS "availableAmt"
FROM (SELECT 
  "accountId",
  SUM(ti.amount) AS "sellAmt",
  "tokenId"
FROM "TransactionInfo" ti 
WHERE ti."txStatus" = 'PENDING' OR ti."txStatus" = 'PROCESSING'
GROUP BY ti."accountId", ti."tokenId"
) AS "pendingOrder"
JOIN "TokenLeafNode" "tokenleaf"
ON "tokenleaf"."accountId" = "pendingOrder"."accountId" AND "tokenleaf"."leafId" = "pendingOrder"."tokenId"; 
  `
})
export class AvailableViewEntity {
  @PrimaryColumn({
    name: 'accountId',
    type: 'decimal',
    precision: 86,
    scale: 0
  })
  accountId!: string;
  @PrimaryColumn({
    name: 'tokenId',
    type: 'decimal',
    precision: 86,
    scale: 0
  })
  tokenId!: string;
  @Column({
    name: 'availableAmt',
    type: 'decimal',
    precision: 86,
    scale: 0,
    default: 0n
  })
  availableAmt!: string;
  @Column({
    name: 'lockedAmt',
    type: 'decimal',
    precision: 86,
    scale: 0,
    default: 0n
  })
  lockedAmt!: string;
}
