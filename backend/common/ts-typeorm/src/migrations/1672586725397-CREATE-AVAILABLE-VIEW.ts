import { MigrationInterface, QueryRunner } from 'typeorm';
import { View } from 'typeorm/schema-builder/view/View';

export class CREATEAVAILABLEVIEW1672586725397 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createView(new View({
      name: 'AvailableView',
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
WHERE ti."txStatus" = 'PENDING'
GROUP BY ti."accountId", ti."tokenId"
) AS "pendingOrder"
JOIN "TokenLeafNode" "tokenleaf"
ON "tokenleaf"."accountId" = "pendingOrder"."accountId" AND "tokenleaf"."leafId" = "pendingOrder"."tokenId";  
      `,
      schema: 'public'
    }));  
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP VIEW public."AvailableView"');
  }
}
