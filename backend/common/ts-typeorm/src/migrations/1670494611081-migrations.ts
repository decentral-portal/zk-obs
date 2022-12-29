import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class migrations1670494611081 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'AuctionBondToken',
        columns: [{
          type: 'integer',
          name: 'bondId',
          isPrimary: true,
          isNullable: false,
          isGenerated: true,
          generationStrategy: 'increment',
        }, {
          type: 'varchar',
          name: 'L1Addr',
          isNullable: true,
          length: '256',
        }, {
          type: 'integer',
          name: 'lastSyncBlocknumberForDepositEvent',
          isNullable: false,
        }, {
          type: 'decimal',
          name: 'L2Addr',
          precision: 86,
          scale: 0,
          isNullable: false,
        }, {
          type: 'decimal',
          name: 'underlyingToken',
          precision: 86,
          scale: 0,
          isNullable: false,
        }, {
          name: 'maturityDate',
          type: 'timestamp without time zone',
          isNullable: false,
        },{
          type: 'integer',
          name: 'status',
          isNullable: false,
          default: '0',
        },  {
          type: 'timestamp without time zone',
          name: 'createdAt',
          isNullable: false,
          default: 'now()' 
        }, {
          type: 'time without time zone',
          name: 'updatedAt',
          isNullable: false,
          default: 'now()' 
        }, {
          type: 'timestamp without time zone',
          name: 'deletedAt',
          isNullable: true,
        }, {
          type: 'varchar',
          name: 'updatedBy',
          isNullable: true,
          length: '256'
        }, {
          type: 'varchar',
          name: 'deletedBy',
          isNullable: true,
          length: '256'
        }],
        schema: 'public',
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('public.AuctionBondToken', true, true, true);
  }

}
