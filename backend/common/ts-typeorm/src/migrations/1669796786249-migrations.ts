import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class migrations1669796786249 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'RollupInformation',
        columns: [{
          type: 'integer',
          name: 'id',
          isPrimary: true,
          isNullable: false,
          isGenerated: true,
          generationStrategy: 'increment',
        }, {
          type: 'integer',
          name: 'lastSyncBlocknumberForRegisterEvent',
          isNullable: false,
        }, {
          type: 'integer',
          name: 'lastSyncBlocknumberForDepositEvent',
          isNullable: false,
        }, {
          type: 'decimal',
          name: 'currentOrderId',
          precision: 86,
          scale: 0,
          isNullable: false,
          default: '0',
        }, {
          type: 'timestamp without time zone',
          name: 'createdAt',
          isNullable: false,
          default: 'now()' 
        }, {
          type: 'timestamp without time zone',
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
    await queryRunner.dropTable('public.RollupInformation', true, true, true);
  }

}
