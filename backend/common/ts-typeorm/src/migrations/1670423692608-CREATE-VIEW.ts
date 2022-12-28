import { MigrationInterface, QueryRunner } from 'typeorm';
import { View } from 'typeorm/schema-builder/view/View';

export class CREATEVIEW1670423692608 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createView(new View({
      name: 'AuctionRemainOrderView',
      expression: `SELECT 
      main."L2TokenAddrTokenLending" AS "L2TokenAddrTokenLending",
      main."L2TokenAddrTokenCollateral" AS "L2TokenAddrTokenCollateral",
      main."L2TokenAddrTokenBorrowing" AS "L2TokenAddrTokenBorrowing",
      main."lendingAmt" - cost."lendingAmt" AS "lendingAmt",
      main."collateralAmt" - cost."collateralAmt" AS "collateralAmt",
      main."borrowingAmt" - cost."borrowingAmt" AS "borrowingAmt",
      main."orderId" AS "orderId",
      main."L2TokenAddrTSL" AS "L2TokenAddrTSL",
      main."L2AddrFrom" AS "L2AddrFrom",
      main."L2AddrTo" AS "L2AddrTo" 
    FROM(SELECT 
      SUM(match."lendingAmt") AS "lendingAmt",
      SUM(match."collateralAmt") AS "collateralAmt",
      SUM(match."borrowingAmt") AS "borrowingAmt",
      match."matchId" AS "orderId"
    FROM "public"."AuctionMatchOrder" match  
    GROUP BY match."matchId") AS cost join "AuctionMainOrder" main on main."orderId" = cost."orderId";
      `,
      schema: 'public'
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // await queryRunner.dropView('AuctionRemainOrderView');
    await queryRunner.query('DROP VIEW public."AuctionRemainOrderView"');
  }
}
