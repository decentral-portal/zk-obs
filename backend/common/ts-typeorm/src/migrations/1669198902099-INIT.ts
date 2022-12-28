import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import { CircuitName } from '../account/blockInformation.entity';
import { Role } from '../account/role.enum';
import { TS_STATUS } from '../account/tsStatus.enum';

export class INIT_1669198902099 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'AccountInformation',
        columns: [
          {
            name: 'L1Address',
            type: 'varchar',
            length: '256',
            isPrimary: true,
            isNullable: false,
          },
          {
            name: 'L2Address',
            type: 'decimal',
            precision: 86,
            scale: 0,
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'email',
            type: 'varchar',
            length: '256',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'lastedLoginIp',
            type: 'varchar',
            length: '256',
            isNullable: true
          },
          {
            name: 'lastLoginTime',
            type: 'timestamp without time zone',
            isNullable: true,
            default: 'now()',
          },
          {
            name: 'role',
            type: 'enum',
            enum: [
              Role.ADMIN, Role.MEMBER, Role.OPERATOR
            ],
            enumName: 'Role',
            isNullable: false,
            default: `'${Role.MEMBER}'`,
          },
          {
            type: 'varchar',
            name: 'password',
            length: '300',
            isNullable: true,
          },
          {
            name: 'refreshToken',
            type: 'varchar',
            length: '400',
            isNullable: true,
            default: null,
          },
          {
            name: 'createdAt',
            type: 'timestamp without time zone',
            isNullable: false,
            default: 'now()'
          },
          {
            name: 'updatedAt',
            type: 'timestamp without time zone',
            isNullable: false,
            default: 'now()'
          },
          {
            name: 'deletedAt',
            type: 'timestamp without time zone',
            isNullable: true
          },
          {
            type: 'varchar',
            name: 'updatedBy',
            length: '300',
            isNullable: true
          },
          {
            type: 'varchar',
            name: 'deletedBy',
            length: '300',
            isNullable: true
          }
        ],
        schema: 'public',
      })
    );
    await queryRunner.createTable(
      new Table({
        name: 'AccountMerkleTreeNode',
        columns: [
          {
            type: 'decimal',
            name: 'id',
            isPrimary: true,
            precision: 86,
            scale: 0,
            isNullable: false
          },
          {
            type: 'decimal',
            name: 'hash',
            precision: 86,
            scale: 0,
            isNullable: false
          },
          {
            type: 'decimal',
            name: 'leafId',
            precision: 86,
            scale: 0,
            isNullable: true,
            isUnique: true,
          },
        ],
        schema: 'public',
        foreignKeys: [{
          name: 'leaf',
          columnNames: ['leafId'],
          referencedColumnNames: ['L2Address'],
          referencedTableName: 'AccountInformation',
          onDelete: 'RESTRICT',
          onUpdate: 'CASCADE'
        }]
      })
    );
    await queryRunner.createTable(
      new Table({
        name: 'AccountLeafNode',
        columns: [{
          type: 'decimal',
          name: 'leafId',
          isPrimary: true,
          precision: 86,
          scale: 0,
        }, {
          type: 'decimal',
          name: 'tsPubKeyX',
          precision: 86,
          scale: 0,
          isNullable: false,
          default: 0n,
        }, {
          type: 'decimal',
          name: 'tsPubKeyY',
          precision: 86,
          scale: 0,
          isNullable: false,
          default: 0n,
        }, {
          type: 'decimal',
          name: 'nonce',
          precision: 86,
          scale: 0,
          isNullable: false,
          default: 0n,
        }, {
          type: 'decimal',
          name: 'tokenRoot',
          precision: 86,
          scale: 0,
          isNullable: false,
          default: 0n,
        }],
        foreignKeys: [
          {
            name: 'accountMerkleTreeNode',
            columnNames: ['leafId'],
            referencedColumnNames: ['leafId'],
            referencedTableName: 'AccountMerkleTreeNode',
            onDelete: 'RESTRICT',
            onUpdate: 'CASCADE'
          }
        ]
      })
    );
    await queryRunner.createTable(
      new Table({
        name: 'TokenMerkleTreeNode',
        columns: [
          {
            type: 'decimal',
            name: 'L2Address',
            isPrimary: true,
            precision: 86,
            scale: 0,
            isNullable: false,
          }, 
          {
            type: 'decimal',
            name: 'id',
            isPrimary: true,
            precision: 86, 
            scale: 0,
            isNullable: false,
          },
          {
            type: 'decimal',
            name: 'hash',
            precision: 86,
            scale: 0,
            isNullable: false
          },
          {
            type: 'decimal',
            name: 'leafId',
            precision: 86,
            scale: 0,
            isNullable: true,
            isUnique: true,
          },
        ],
        schema: 'public',
        foreignKeys: [{
          name: 'L2Address',
          columnNames: ['L2Address'],
          referencedColumnNames: ['leafId'],
          referencedTableName: 'AccountMerkleTreeNode',
          onDelete: 'RESTRICT',
          onUpdate: 'CASCADE'
        }],
        uniques: [{
          name: 'uniqueTokenLeafNode',
          columnNames: ['L2Address', 'leafId']
        }]
      })
    );
    await queryRunner.createTable(
      new Table({
        name: 'TokenLeafNode',
        columns: [{
          type: 'decimal',
          name: 'leafId',
          precision: 86,
          scale: 0,
          isPrimary: true,
        }, {
          type: 'decimal',
          name: 'L2Address',
          precision: 86,
          scale: 0,
          isPrimary: true
        }
        , {
          type: 'decimal',
          name: 'L2TokenAddr',
          precision: 86,
          scale: 0,
          isNullable: false,
        }, {
          type: 'decimal',
          name: 'lockedAmt',
          precision: 86,
          scale: 0,
          default: 0n
        },
        {
          type: 'decimal',
          name: 'availableAmt',
          precision: 86,
          scale: 0,
          default: 0
        },],
        foreignKeys: [
          {
            name: 'tokenLeafNodeMetadata',
            columnNames: ['leafId', 'L2Address'],
            referencedColumnNames: ['leafId', 'L2Address'],
            referencedTableName: 'TokenMerkleTreeNode',
            onDelete: 'RESTRICT',
            onUpdate: 'CASCADE'
          }
        ]
      })
    );
    await queryRunner.createTable(
      new Table({
        name: 'BlockInfo',
        columns: [{
          type: 'integer',
          name: 'blockId',
          isPrimary: true,
        }, {
          type: 'varchar',
          name: 'blockHash',
          length: '256',
          isNullable: false,
        }, {
          type: 'varchar',
          name: 'L1TransactionHash',
          length: '512',
          isNullable: false,
        }, {
          type: 'timestamp without time zone',
          name: 'verifiedTime',
          isNullable: true,
        }, {
          type: 'varchar',
          name: 'operatorAddress',
          length: '256',
        }, {
          type: 'text',
          name: 'rawData',
          isNullable: true,
        }, {
          type: 'json',
          name: 'callData',
          isNullable: true,
          default: '\'{}\'',
        }, {
          type: 'json',
          name: 'proof',
          isNullable: true,
          default: '\'{}\'',
        }, {
          type: 'integer',
          name: 'blockStatus',
          isNullable: false,
          default: 0,
        }, {
          type: 'timestamp without time zone',
          name: 'createdAt',
          isNullable: false,
          default: 'now()',
        }, {
          type: 'varchar',
          name: 'createdBy',
          length: '256',
          isNullable: true,
        }, {
          type: 'timestamp without time zone',
          name: 'updatedAt',
          isNullable: false,
          default: 'now()',
        }, {
          type: 'varchar',
          name: 'updatedBy',
          length: '256',
          isNullable: true, 
        }, {
          type: 'timestamp without time zone',
          name: 'deletedAt',
          isNullable: true,
        }, {
          type: 'varchar',
          name: 'deletedBy',
          length: '256',
          isNullable: true,
        }],
        schema: 'public',
      })
    );
    await queryRunner.createTable(
      new Table({
        name: 'TransactionInfo',
        columns: [{
          type: 'integer',
          name: 'txId',
          isPrimary: true,
          isNullable: false,
          isGenerated: true,
          generationStrategy: 'increment',
        }, {
          type: 'integer',
          name: 'blockNumber',
          isNullable: false,
        } ,
        {
          type: 'integer',
          name: 'reqType',
          isNullable: false
        }, {
          type: 'decimal',
          name: 'L2AddrFrom',
          precision: 86,
          scale: 0,
          isNullable: false,
        }, {
          type: 'decimal',
          name: 'L2AddrTo',
          precision: 86,
          scale: 0,
          isNullable: false,
        }, {
          type: 'decimal',
          name: 'L2TokenAddr',
          precision: 86,
          scale: 0,
          isNullable: false,
        }, {
          type: 'decimal',
          name: 'amount',
          precision: 86,
          scale: 0,
          isNullable: false
        }, {
          type: 'decimal',
          name: 'nonce',
          precision: 86,
          scale: 0,
          isNullable: false
        }, {
          type: 'decimal',
          name: 'eddsaSig',
          precision: 86,
          scale: 0,
          isNullable: false 
        }, {
          type: 'decimal',
          name: 'ecdsaSig',
          precision: 86,
          scale: 0,
          isNullable: false
        }, {
          type: 'decimal',
          name: 'arg0',
          precision: 86,
          scale: 0,
          isNullable: true
        }, {
          type: 'decimal',
          name: 'arg1',
          precision: 86,
          scale: 0,
          isNullable: true
        }, {
          type: 'decimal',
          name: 'arg2',
          precision: 86,
          scale: 0,
          isNullable: true
        }, {
          type: 'decimal',
          name: 'arg3',
          precision: 86,
          scale: 0,
          isNullable: true
        }, {
          type: 'decimal',
          name: 'arg4',
          precision: 86,
          scale: 0,
          isNullable: true
        },{
          type: 'decimal',
          name: 'fee',
          precision: 86,
          scale: 0,
          isNullable: false,
          default: 0
        },{
          type: 'decimal',
          name: 'feeToken',
          precision: 86,
          scale: 0,
          isNullable: false,
          default: 0
        },{
          type: 'json',
          name: 'metadata',
          isNullable: false,
          default: '\'{}\'',
        }, {
          type: 'enum',
          name: 'tsStatus',
          enumName: 'TX_STATUS',
          enum: [
            TS_STATUS.PENDING,
            TS_STATUS.PROCESSING,
            TS_STATUS.L2EXECUTED,
            TS_STATUS.L2CONFIRMED,
            TS_STATUS.L1CONFIRMED,
            TS_STATUS.FAILED,
            TS_STATUS.REJECTED
          ],
          isNullable: false,
          default: `'${TS_STATUS.PENDING}'`
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
        },{
          type: 'timestamp without time zone',
          name: 'deletedAt',
          isNullable: true,
        }, {
          type: 'varchar',
          name: 'updatedBy',
          length: '256',
          isNullable: true,
        }, {
          type: 'varchar',
          name: 'deletedBy',
          length: '256',
          isNullable: true,
        }],
        schema: 'public',
        foreignKeys: [{
          name: 'L2FromAccountInfo',
          columnNames: ['L2AddrFrom'],
          referencedColumnNames: ['L2Address'],
          referencedTableName: 'AccountInformation'
        },{
          name: 'L2ToAccountInfo',
          columnNames: ['L2AddrTo'],
          referencedColumnNames: ['L2Address'],
          referencedTableName: 'AccountInformation'
        }, {
          name: 'BlockInfo',
          columnNames: ['blockNumber'],
          referencedColumnNames: ['blockId'],
          referencedTableName: 'BlockInfo',
          onDelete: 'RESTRICT',
          onUpdate: 'CASCADE'
        }]
      })
    );
    await queryRunner.createTable(
      new Table({
        name: 'AuctionOrderMerkleTreeNode',
        columns: [{
          type: 'decimal',
          name: 'id',
          isPrimary: true,
          precision: 86,
          scale: 0,
        }, {
          type: 'decimal',
          name: 'hash',
          precision: 86,
          scale: 0,
          isNullable: false
        }, {
          type: 'decimal',
          name: 'leafId',
          precision: 86,
          scale: 0,
          isNullable: true,
          isUnique: true
        }],
        schema: 'public',
      })
    );
    await queryRunner.createTable(
      new Table({
        name: 'AuctionOrderLeafNode',
        columns: [{
          type: 'decimal',
          name: 'leafId',
          isPrimary: true,
          precision: 86,
          scale: 0,
        }, {
          type: 'decimal',
          name: 'txId',
          precision: 86,
          scale: 0,
          isNullable: false,
          default: 0,
        }, {
          type: 'integer',
          name: 'reqType',
          isNullable: false,
          default: 0,
        },{
          type: 'decimal',
          name: 'L2AddrFrom',
          precision: 86,
          scale: 0,
          isNullable: false,
          default: 0,
        }, 
        {
          type: 'decimal',
          name: 'L2AddrTo',
          precision: 86,
          scale: 0,
          isNullable: false,
          default: 0,
        }, {
          type: 'decimal',
          name: 'L2TokenAddr',
          precision: 86,
          scale: 0,
          isNullable: false
        }, {
          type: 'decimal',
          name: 'amount',
          precision: 86,
          scale: 0,
          isNullable: false,
          default: 0,
        }, {
          type: 'decimal',
          name: 'nonce',
          precision: 86,
          scale: 0,
          isNullable: false,
          default: 0,
        }, {
          type: 'decimal',
          name: 'maturityDate',
          precision: 86,
          scale: 0,
          isNullable: false,
          default: 0,
        }, {
          type: 'decimal',
          name: 'expiredTime',
          precision: 86,
          scale: 0,
          isNullable: false,
          default: 0,
        }, {
          type: 'decimal',
          name: 'interest',
          precision: 86,
          scale: 0,
          isNullable: false,
          default: 0,
        }, {
          type: 'decimal',
          name: 'L2TokenAddrBorrowing',
          precision: 86,
          scale: 0,
          isNullable: false,
          default: 0,
        }, {
          type: 'decimal',
          name: 'borrowingAmt',
          precision: 86,
          scale: 0,
          isNullable: false,
          default: 0,
        }],
        schema: 'public',
        foreignKeys: [{
          name: 'L2AddrFrom',
          columnNames: ['L2AddrFrom'],
          referencedColumnNames: ['L2Address'],
          referencedTableName: 'AccountInformation',
          onDelete: 'RESTRICT',
          onUpdate: 'CASCADE'
        },{
          name: 'L2AddrTo',
          columnNames: ['L2AddrTo'],
          referencedColumnNames: ['L2Address'],
          referencedTableName: 'AccountInformation',
          onDelete: 'RESTRICT',
          onUpdate: 'CASCADE'
        }, {
          name: 'auctionOrderMerkleTreeNode',
          columnNames: ['leafId'],
          referencedColumnNames: ['leafId'],
          referencedTableName: 'AuctionOrderMerkleTreeNode',
          onDelete: 'RESTRICT',
          onUpdate: 'CASCADE'
        }]
      }),
    );
    await queryRunner.createTable(
      new Table({
        name: 'AuctionMainOrder',
        columns: [{
          type: 'decimal',
          name: 'orderId',
          precision: 86,
          scale: 0,
          isPrimary: true,
        }, {
          type: 'integer',
          name: 'reqType',
          isNullable: true,
          default: 0,
        }, {
          type: 'decimal',
          name: 'L2AddrFrom',
          precision: 86,
          scale: 0,
          isNullable: true,
          default: 0,
        }, {
          type: 'decimal',
          name: 'L2AddrTo',
          precision: 86,
          scale: 0,
          isNullable: true,
          default: 0,
        }, {
          type: 'decimal',
          name: 'L2TokenAddrTokenLending',
          precision: 86,
          scale: 0,
          isNullable: true,
          default: 0,
        }, {
          type: 'decimal',
          name: 'lendingAmt',
          precision: 86,
          scale: 0,
          isNullable: true,
          default: 0,
        }, {
          type: 'decimal',
          name: 'L2TokenAddrTokenCollateral',
          precision: 86,
          scale: 0,
          isNullable: true,
          default: 0,
        }, {
          type: 'decimal',
          name: 'collateralAmt',
          precision: 86,
          scale: 0,
          isNullable: true,
          default: 0,
        }, {
          type: 'decimal',
          name: 'L2TokenAddrTokenBorrowing',
          precision: 86,
          scale: 0,
          isNullable: true,
          default: 0,
        }, {
          type: 'decimal',
          name: 'borrowingAmt',
          precision: 86,
          scale: 0,
          isNullable: true,
          default: 0,
        }, {
          type: 'decimal',
          name: 'L2TokenAddrTSL',
          precision: 86,
          scale: 0,
          isNullable: true,
          default: 0,
        }, {
          type: 'decimal',
          name: 'interest',
          precision: 86,
          scale: 0,
          isNullable: true,
          default: 0,
        }, {
          type: 'decimal',
          name: 'nonce',
          precision: 86,
          scale: 0,
          isNullable: true,
          default: 0,
        }, {
          type: 'timestamp without time zone',
          name: 'expiredTime',
          isNullable: true,
          default: 'now()',
        }, {
          type: 'timestamp without time zone',
          name: 'maturityDate',
          isNullable: true,
          default: 'now()',
        }, {
          type: 'integer',
          name: 'orderStatus',
          isNullable: true,
          default: 0,
        }, {
          type: 'timestamp without time zone',
          name: 'createdAt',
          isNullable: true,
          default: 'now()',
        }, {
          type: 'varchar',
          name: 'createdBy',
          length: '300',
          isNullable: true, 
        }, {
          type: 'timestamp without time zone',
          name: 'updatedAt',
          isNullable: true,
          default: 'now()',
        }, {
          type: 'varchar',
          name: 'updatedBy',
          length: '300',
          isNullable: true, 
        }, {
          type: 'timestamp without time zone',
          name: 'deletedAt',
          isNullable: true,
        }, {
          type: 'varchar',
          name: 'deletedBy',
          length: '300',
          isNullable: true,
        }],
        schema: 'public',
        foreignKeys: [{
          name: 'L2AddrFromAccount',
          columnNames: ['L2AddrFrom'],
          referencedColumnNames: ['L2Address'],
          referencedTableName: 'AccountInformation',
        }, {
          name: 'L2AddrToAccount',
          columnNames: ['L2AddrTo'],
          referencedColumnNames: ['L2Address'],
          referencedTableName: 'AccountInformation',
        }]
      })
    );
    await queryRunner.createTable(
      new Table({
        name: 'AuctionMatchOrder',
        columns: [{
          type: 'integer',
          name: 'txId',
          isPrimary: true,
        }, {
          type: 'integer',
          name: 'reqType',
          isNullable: false,
          default: 0,
        }, {
          type: 'decimal',
          name: 'matchId',
          precision: 86,
          scale: 0,
          isNullable: false,
        }, {
          type: 'decimal',
          name: 'orderId',
          precision: 86,
          scale: 0,
          isNullable: false,
        }, {
          type: 'integer',
          name: 'blockNumber',
          isNullable: false,
        }, {
          type: 'decimal',
          name: 'L2AddrFrom',
          precision: 86,
          scale: 0,
          isNullable: false,
          default: 0,
        }, {
          type: 'decimal',
          name: 'L2AddrTo',
          precision: 86,
          scale: 0,
          isNullable: false,
          default: 0,
        }, {
          type: 'decimal',
          name: 'L2TokenAddrTokenLending',
          precision: 86,
          scale: 0,
          isNullable: false,
          default: 0,
        }, {
          type: 'decimal',
          name: 'lendingAmt',
          precision: 86,
          scale: 0,
          isNullable: false,
          default: 0,
        }, {
          type: 'decimal',
          name: 'L2TokenAddrTokenCollateral',
          precision: 86,
          scale: 0,
          isNullable: false,
          default: 0,
        }, {
          type: 'decimal',
          name: 'collateralAmt',
          precision: 86,
          scale: 0,
          isNullable: false,
          default: 0,
        }, {
          type: 'decimal',
          name: 'L2TokenAddrTokenBorrowing',
          precision: 86,
          scale: 0,
          isNullable: false,
          default: 0,
        }, {
          type: 'decimal',
          name: 'borrowingAmt',
          precision: 86,
          scale: 0,
          isNullable: false,
          default: 0,
        }, {
          type: 'decimal',
          name: 'L2TokenAddrTSL',
          precision: 86,
          scale: 0,
          isNullable: false,
          default: 0,
        }, {
          type: 'decimal',
          name: 'interest',
          precision: 86,
          scale: 0,
          isNullable: false,
          default: 0,
        },  {
          type: 'decimal',
          name: 'nonce',
          precision: 86,
          scale: 0,
          isNullable: true,
          default: 0,
        }, {
          type: 'timestamp without time zone',
          name: 'expiredTime',
          isNullable: true,
          default: 'now()',
        }, {
          type: 'timestamp without time zone',
          name: 'maturityDate',
          isNullable: true,
          default: 'now()',
        }, {
          type: 'integer',
          name: 'orderStatus',
          isNullable: true,
          default: 0,
        }, {
          type: 'timestamp without time zone',
          name: 'createdAt',
          isNullable: true,
          default: 'now()',
        }, {
          type: 'varchar',
          name: 'createdBy',
          length: '300',
          isNullable: true
        }, {
          type: 'timestamp without time zone',
          name: 'updatedAt',
          isNullable: true,
          default: 'now()',
        }, {
          type: 'varchar',
          name: 'updatedBy',
          length: '300',
          isNullable: true
        }, {
          type: 'timestamp without time zone',
          name: 'deletedAt',
          isNullable: true,
        }, {
          type: 'varchar',
          name: 'deletedBy',
          length: '300',
          isNullable: true,
        }], 
        schema: 'public',
        foreignKeys: [{
          name: 'L2AddrFromAccount',
          columnNames: ['L2AddrFrom'],
          referencedColumnNames: ['L2Address'],
          referencedTableName: 'AccountInformation',
          onDelete: 'RESTRICT',
          onUpdate: 'CASCADE',
        }, {
          name: 'L2AddrToAccount',
          columnNames: ['L2AddrTo'],
          referencedColumnNames: ['L2Address'],
          referencedTableName: 'AccountInformation',
          onDelete: 'RESTRICT',
          onUpdate: 'CASCADE',
        }, {
          name: 'MainOrder',
          columnNames: ['matchId'],
          referencedColumnNames: ['orderId'],
          referencedTableName: 'AuctionMainOrder',
          onDelete: 'RESTRICT',
          onUpdate: 'CASCADE',
        }]
      })
    );

    await queryRunner.createTable(
      new Table({
        name: 'BlockInformation',
        columns: [{
          type: 'integer',
          name: 'blockNumber',
          isPrimary: true,
          isNullable: false,
          isGenerated: true,
          generationStrategy: 'increment',
        }, {
          type: 'enum',
          name: 'name',
          enumName: 'CircuitName',
          enum: [
            CircuitName.REGISTER, CircuitName.NORMAL, CircuitName.AUCTION_MATCH, CircuitName.SECONDARY_MATCH, CircuitName.REPO_MATCH,
          ],
          isNullable: false,
          default: `'${CircuitName.NORMAL}'`
        }, {
          type: 'decimal',
          name: 'startTxId',
          precision: 86,
          scale: 0,
          isNullable: false
        }, {
          type: 'decimal',
          name: 'endTxId',
          precision: 86,
          scale: 0,
          isNullable: false
        }, {
          type: 'enum',
          name: 'status',
          enumName: 'TX_STATUS',
          enum: [
            TS_STATUS.PENDING,
            TS_STATUS.PROCESSING,
            TS_STATUS.L2EXECUTED,
            TS_STATUS.L2CONFIRMED,
            TS_STATUS.L1CONFIRMED,
            TS_STATUS.FAILED,
            TS_STATUS.REJECTED
          ],
          isNullable: false,
          default: `'${TS_STATUS.PENDING}'`
        }, {
          type: 'json',
          name: 'circuitInput',
          isNullable: false,
          default: '\'{}\'',
        }, {
          type: 'json',
          name: 'proof',
          isNullable: false,
          default: '\'{}\'',
        }, {
          type: 'json',
          name: 'publicInput',
          isNullable: false,
          default: '\'{}\'',
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
          length: '256',
          isNullable: true,
        }, {
          type: 'varchar',
          name: 'deletedBy',
          length: '256',
          isNullable: true,
        },],
        schema: 'public',
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('public.AuctionMatchOrder', true, true, true);
    await queryRunner.dropTable('public.AuctionMainOrder', true, true, true);
    await queryRunner.dropTable('public.AuctionOrderLeafNode', true, true, true);
    await queryRunner.dropTable('public.AuctionOrderMerkleTreeNode', true, true, true);
    await queryRunner.dropTable('public.TransactionInfo', true, true, true);
    await queryRunner.dropTable('public.BlockInformation', true, true, true);
    await queryRunner.dropTable('public.BlockInfo', true, true, true);
    await queryRunner.dropTable('public.TokenLeafNode', true, true, true);
    await queryRunner.dropTable('public.TokenMerkleTreeNode', true, true, true);
    await queryRunner.dropTable('public.AccountLeafNode', true, true, true);
    await queryRunner.dropTable('public.AccountMerkleTreeNode', true, true, true);
    await queryRunner.dropTable('public.AccountInformation', true, true, true);
    await queryRunner.query('DROP TYPE "Role";');
    // await queryRunner.query('DROP TYPE "ORDER_STATUS"');
    await queryRunner.query('DROP TYPE "TX_STATUS";');
  }

}