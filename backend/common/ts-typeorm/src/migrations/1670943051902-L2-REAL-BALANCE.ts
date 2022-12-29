import { MigrationInterface, QueryRunner } from 'typeorm'
import { View } from 'typeorm/schema-builder/view/View'

export class L2_REALBALANCE_1670943051902 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createView(new View({
      name: 'AuctionL2RealBalanceView',
      expression:`SELECT 
        tln."L2Address" AS "L2Address",
        tln."L2TokenAddr" AS "L2TokenAddr",
        tln."lockedAmt" + arov."lendingAmt"  + arov."collateralAmt"  AS "lockedAmt",
        tln."availableAmt"  - arov."lendingAmt"  - arov."collateralAmt" AS "availableAmt"
      FROM "TokenLeafNode" tln JOIN "AuctionRemainOrderView" arov 
      ON tln."L2Address" = arov."L2AddrFrom" AND tln."L2TokenAddr" = arov."L2TokenAddrTSL";`,
      schema: 'public'
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP VIEW public."AuctionL2RealBalanceView";');
  }

}
