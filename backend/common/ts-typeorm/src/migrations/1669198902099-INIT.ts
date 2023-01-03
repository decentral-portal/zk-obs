import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import { BLOCK_STATUS } from '../account/blockStatus.enum';
import { Role } from '../account/role.enum';
import { TS_STATUS } from '../account/tsStatus.enum';
import { TsSide } from '../auctionOrder/tsSide.enum';

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
            name: 'accountId',
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
            isNullable: true,
            isUnique: false,
          },
          {
            name: 'lastedLoginIp',
            type: 'varchar',
            length: '256',
            isNullable: true,
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
            enum: [Role.ADMIN, Role.MEMBER, Role.OPERATOR],
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
            name: 'label',
            type: 'jsonb',
            isNullable: true,
            default: '\'{}\'',
          },
          {
            type: 'varchar',
            name: 'tsPubKeyX',
            length: '100',
            isNullable: false,
            default: '\'0\'',
          },
          {
            type: 'varchar',
            name: 'tsPubKeyY',
            length: '100',
            isNullable: false,
            default: '\'0\'',
          },
          {
            name: 'labelBy',
            type: 'varchar',
            length: '256',
            isNullable: true,
            default: null,
          },
          {
            name: 'createdAt',
            type: 'timestamp without time zone',
            isNullable: false,
            default: 'now()',
          },
          {
            name: 'updatedAt',
            type: 'timestamp without time zone',
            isNullable: false,
            default: 'now()',
          },
          {
            name: 'deletedAt',
            type: 'timestamp without time zone',
            isNullable: true,
          },
          {
            name: 'createdBy',
            type: 'varchar',
            length: '300',
            isNullable: true,
          },
          {
            type: 'varchar',
            name: 'updatedBy',
            length: '300',
            isNullable: true,
          },
          {
            type: 'varchar',
            name: 'deletedBy',
            length: '300',
            isNullable: true,
          },
        ],
        schema: 'public',
      }),
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
            isNullable: false,
          },
          {
            type: 'decimal',
            name: 'hash',
            precision: 86,
            scale: 0,
            isNullable: false,
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
        // foreignKeys: [
        //   {
        //     name: 'leaf',
        //     columnNames: ['leafId'],
        //     referencedColumnNames: ['accountId'],
        //     referencedTableName: 'AccountInformation',
        //     onDelete: 'RESTRICT',
        //     onUpdate: 'CASCADE',
        //   },
        // ],
      }),
    );
    await queryRunner.createTable(
      new Table({
        name: 'AccountLeafNode',
        columns: [
          {
            type: 'decimal',
            name: 'leafId',
            isPrimary: true,
            precision: 86,
            scale: 0,
          },
          {
            type: 'decimal',
            name: 'tsAddr',
            precision: 86,
            scale: 0,
            isNullable: false,
            default: 0n,
          },
          {
            type: 'decimal',
            name: 'nonce',
            precision: 86,
            scale: 0,
            isNullable: false,
            default: 0n,
          },
          {
            type: 'decimal',
            name: 'tokenRoot',
            precision: 86,
            scale: 0,
            isNullable: false,
            default: 0n,
          },
        ],
        foreignKeys: [
          {
            name: 'accountMerkleTreeNode',
            columnNames: ['leafId'],
            referencedColumnNames: ['leafId'],
            referencedTableName: 'AccountMerkleTreeNode',
            onDelete: 'RESTRICT',
            onUpdate: 'CASCADE',
          },
        ],
      }),
    );
    await queryRunner.createTable(
      new Table({
        name: 'TokenMerkleTreeNode',
        columns: [
          {
            type: 'decimal',
            name: 'accountId',
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
            isNullable: false,
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
        // foreignKeys: [
        //   {
        //     name: 'accountId',
        //     columnNames: ['accountId'],
        //     referencedColumnNames: ['leafId'],
        //     referencedTableName: 'AccountMerkleTreeNode',
        //     onDelete: 'RESTRICT',
        //     onUpdate: 'CASCADE',
        //   },
        // ],
        uniques: [
          {
            name: 'uniqueTokenLeafNode',
            columnNames: ['accountId', 'leafId'],
          },
        ],
      }),
    );
    await queryRunner.createTable(
      new Table({
        name: 'TokenLeafNode',
        columns: [
          {
            type: 'decimal',
            name: 'leafId',
            precision: 86,
            scale: 0,
            isPrimary: true,
          },
          {
            type: 'decimal',
            name: 'accountId',
            precision: 86,
            scale: 0,
            isPrimary: true,
          },
          {
            type: 'decimal',
            name: 'lockedAmt',
            precision: 86,
            scale: 0,
            default: 0n,
          },
          {
            type: 'decimal',
            name: 'availableAmt',
            precision: 86,
            scale: 0,
            default: 0,
          },
        ],
        foreignKeys: [
          {
            name: 'tokenLeafNodeMetadata',
            columnNames: ['leafId', 'accountId'],
            referencedColumnNames: ['leafId', 'accountId'],
            referencedTableName: 'TokenMerkleTreeNode',
            onDelete: 'RESTRICT',
            onUpdate: 'CASCADE',
          },
        ],
      }),
    );
    await queryRunner.createTable(
      new Table({
        name: 'BlockInformation',
        columns: [
          {
            type: 'integer',
            name: 'blockNumber',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            type: 'varchar',
            name: 'blockHash',
            length: '256',
            isNullable: true,
          },
          {
            type: 'varchar',
            name: 'L1TransactionHash',
            length: '512',
            isNullable: false,
          },
          {
            type: 'timestamp without time zone',
            name: 'verifiedAt',
            isNullable: true,
          },
          {
            type: 'varchar',
            name: 'operatorAddress',
            length: '256',
          },
          {
            type: 'text',
            name: 'rawData',
            isNullable: true,
          },
          {
            type: 'json',
            name: 'callData',
            isNullable: true,
            default: '\'{}\'',
          },
          {
            type: 'json',
            name: 'proof',
            isNullable: true,
            default: '\'{}\'',
          },
          {
            type: 'enum',
            name: 'blockStatus',
            isNullable: false,
            enumName: 'BLOCK_STATUS',
            enum: [BLOCK_STATUS.PROCESSING, BLOCK_STATUS.L2EXECUTED, BLOCK_STATUS.L2CONFIRMED, BLOCK_STATUS.L1CONFIRMED],
            default: `'${BLOCK_STATUS.PROCESSING}'`,
          },
          {
            type: 'timestamp without time zone',
            name: 'createdAt',
            isNullable: false,
            default: 'now()',
          },
          {
            type: 'varchar',
            name: 'createdBy',
            length: '256',
            isNullable: true,
          },
          {
            type: 'timestamp without time zone',
            name: 'updatedAt',
            isNullable: false,
            default: 'now()',
          },
          {
            type: 'varchar',
            name: 'updatedBy',
            length: '256',
            isNullable: true,
          },
          {
            type: 'timestamp without time zone',
            name: 'deletedAt',
            isNullable: true,
          },
          {
            type: 'varchar',
            name: 'deletedBy',
            length: '256',
            isNullable: true,
          },
        ],
        schema: 'public',
      }),
    );
    await queryRunner.createTable(
      new Table({
        name: 'TransactionInfo',
        columns: [
          {
            type: 'integer',
            name: 'txId',
            isPrimary: true,
            isNullable: false,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            type: 'integer',
            name: 'blockNumber',
            isNullable: true,
          },
          {
            type: 'integer',
            name: 'reqType',
            isNullable: true,
            default: 0,
          },
          {
            type: 'decimal',
            name: 'accountId',
            precision: 86,
            scale: 0,
            isNullable: false,
            default: 0n,
          },
          {
            type: 'decimal',
            name: 'tokenId',
            precision: 86,
            scale: 0,
            isNullable: false,
            default: 0n,
          },
          {
            type: 'decimal',
            name: 'accumulatedSellAmt',
            precision: 86,
            scale: 0,
            isNullable: false,
            default: 0n,
          },
          {
            type: 'decimal',
            name: 'accumulatedBuyAmt',
            precision: 86,
            scale: 0,
            isNullable: false,
            default: 0n,
          },
          {
            type: 'decimal',
            name: 'amount',
            precision: 86,
            scale: 0,
            isNullable: false,
            default: 0n,
          },
          {
            type: 'decimal',
            name: 'nonce',
            precision: 86,
            scale: 0,
            isNullable: false,
            default: 0n,
          },
          {
            type: 'json',
            name: 'eddsaSig',
            isNullable: false,
            default: `'${JSON.stringify({
              R8: ['0', '0'],
              S: '0',
            })}'`,
          },
          {
            type: 'varchar',
            name: 'ecdsaSig',
            length: '66',
            isNullable: false,
            default: '\'\'',
          },
          {
            type: 'decimal',
            name: 'arg0',
            precision: 86,
            scale: 0,
            isNullable: true,
            default: 0n,
          },
          {
            type: 'decimal',
            name: 'arg1',
            precision: 86,
            scale: 0,
            isNullable: false,
            default: 0n,
          },
          {
            type: 'decimal',
            name: 'arg2',
            precision: 86,
            scale: 0,
            isNullable: false,
            default: 0n,
          },
          {
            type: 'decimal',
            name: 'arg3',
            precision: 86,
            scale: 0,
            isNullable: false,
            default: 0n,
          },
          {
            type: 'decimal',
            name: 'arg4',
            precision: 86,
            scale: 0,
            isNullable: false,
            default: 0n,
          },
          {
            type: 'varchar',
            name: 'tsPubKeyX',
            length: '100',
            isNullable: false,
            default: '\'0\'',
          },
          {
            type: 'varchar',
            name: 'tsPubKeyY',
            length: '100',
            isNullable: false,
            default: '\'0\'',
          },
          {
            type: 'decimal',
            name: 'fee',
            precision: 86,
            scale: 0,
            isNullable: false,
            default: 0n,
          },
          {
            type: 'decimal',
            name: 'feeToken',
            precision: 86,
            scale: 0,
            isNullable: false,
            default: 0n,
          },
          {
            type: 'json',
            name: 'metadata',
            isNullable: false,
            default: '\'{}\'',
          },
          {
            type: 'enum',
            name: 'txStatus',
            enumName: 'TX_STATUS',
            enum: [
              TS_STATUS.PENDING,
              TS_STATUS.PROCESSING,
              TS_STATUS.L2EXECUTED,
              TS_STATUS.L2CONFIRMED,
              TS_STATUS.L1CONFIRMED,
              TS_STATUS.FAILED,
              TS_STATUS.REJECTED,
            ],
            isNullable: false,
            default: `'${TS_STATUS.PENDING}'`,
          },
          {
            type: 'timestamp without time zone',
            name: 'createdAt',
            isNullable: false,
            default: 'now()',
          },
          {
            type: 'timestamp without time zone',
            name: 'updatedAt',
            isNullable: false,
            default: 'now()',
          },
          {
            type: 'timestamp without time zone',
            name: 'deletedAt',
            isNullable: true,
          },
          {
            type: 'varchar',
            name: 'createdBy',
            length: '256',
            isNullable: true,
          },
          {
            type: 'varchar',
            name: 'updatedBy',
            length: '256',
            isNullable: true,
          },
          {
            type: 'varchar',
            name: 'deletedBy',
            length: '256',
            isNullable: true,
          },
        ],
        schema: 'public',
        foreignKeys: [
          {
            name: 'L2AccountInfo',
            columnNames: ['accountId'],
            referencedColumnNames: ['accountId'],
            referencedTableName: 'AccountInformation',
          },
          {
            name: 'BlockInformation',
            columnNames: ['blockNumber'],
            referencedColumnNames: ['blockNumber'],
            referencedTableName: 'BlockInformation',
            onDelete: 'RESTRICT',
            onUpdate: 'CASCADE',
          },
        ],
      }),
    );
    await queryRunner.createTable(
      new Table({
        name: 'ObsOrder',
        schema: 'public',
        columns: [
          {
            name: 'id',
            type: 'int8',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            type: 'int8',
            name: 'txId',
            isNullable: false,
            default: 0,
          },
          {
            name: 'reqType',
            type: 'integer',
            default: '0',
            isNullable: false,
          },
          {
            name: 'side',
            type: 'enum',
            enumName: 'SIDE',
            enum: [TsSide.BUY, TsSide.SELL],
            isNullable: false,
            default: `'${TsSide.BUY}'`,
          },
          {
            name: 'accountId',
            type: 'decimal',
            precision: 86,
            scale: 0,
            isNullable: false,
            default: 0n,
          },
          {
            name: 'marketPair',
            type: 'varchar',
            length: '100',
            isNullable: false,
            default: '\'ETH/USDC\'',
          },
          {
            name: 'price',
            type: 'decimal',
            precision: 86,
            scale: 8,
            isNullable: true,
            default: 0n,
          },
          {
            name: 'mainQty',
            type: 'decimal',
            precision: 86,
            scale: 0,
            isNullable: false,
            default: 0n,
          },
          {
            name: 'baseQty',
            type: 'decimal',
            precision: 86,
            scale: 0,
            isNullable: false,
            default: 0n,
          },
          {
            name: 'remainMainQty',
            type: 'decimal',
            precision: 86,
            scale: 0,
            isNullable: false,
            default: 0n,
          },
          {
            name: 'remainBaseQty',
            type: 'decimal',
            precision: 86,
            scale: 0,
            isNullable: false,
            default: 0n,
          },
          {
            name: 'accumulatedMainQty',
            type: 'decimal',
            precision: 86,
            scale: 0,
            isNullable: false,
            default: 0n,
          },
          {
            name: 'accumulatedBaseQty',
            type: 'decimal',
            precision: 86,
            scale: 0,
            isNullable: false,
            default: 0n,
          },
          {
            name: 'mainTokenId',
            type: 'decimal',
            precision: 86,
            scale: 0,
            isNullable: false,
            default: 0n,
          },
          {
            name: 'baseTokenId',
            type: 'decimal',
            precision: 86,
            scale: 0,
            isNullable: false,
            default: 0n,
          },
          {
            name: 'timestamp',
            type: 'timestamp without time zone',
            precision: 3,
            isNullable: false,
            default: 'now()',
          },
          {
            name: 'isMaker',
            type: 'boolean',
            isNullable: false,
            default: false,
          },
          {
            name: 'orderLeafId',
            type: 'integer',
            isNullable: true,
            isUnique: true,
          },
          {
            name: 'orderStatus',
            type: 'integer',
            isNullable: false,
            default: 1,
          },
          {
            name: 'isVoid',
            type: 'boolean',
            isNullable: false,
            default: false,
          },
          {
            name: 'isCancel',
            type: 'boolean',
            isNullable: false,
            default: false,
          },
        ],
        foreignKeys: [
          {
            name: 'accountInfo',
            columnNames: ['accountId'],
            referencedColumnNames: ['accountId'],
            referencedTableName: 'AccountInformation',
            onDelete: 'RESTRICT',
            onUpdate: 'CASCADE',
          },
        ],
      }),
    );
    await queryRunner.createTable(
      new Table({
        name: 'ObsOrderLeafMerkleTreeNode',
        schema: 'public',
        columns: [
          {
            name: 'id',
            type: 'decimal',
            isPrimary: true,
            precision: 86,
            scale: 0,
          },
          {
            name: 'hash',
            type: 'decimal',
            isNullable: false,
            precision: 86,
            scale: 0,
            default: 0n,
          },
          {
            name: 'leafId',
            type: 'decimal',
            isNullable: true,
            precision: 86,
            scale: 0,
            isUnique: true,
          },
        ],
      }),
    );
    await queryRunner.createTable(
      new Table({
        name: 'ObsOrderLeaf',
        schema: 'public',
        columns: [
          {
            name: 'orderLeafId',
            type: 'decimal',
            isPrimary: true,
            scale: 0,
            isNullable: false,
            default: 0n,
          },
          {
            name: 'txId',
            type: 'int8',
            isNullable: true,
          },
          {
            name: 'reqType',
            type: 'integer',
            isNullable: false,
            default: 0,
          },
          {
            name: 'sender',
            type: 'decimal',
            precision: 86,
            scale: 0,
            isNullable: false,
            default: 0n,
          },
          {
            name: 'receiver',
            type: 'decimal',
            precision: 86,
            scale: 0,
            isNullable: false,
            default: 0n,
          },
          {
            name: 'sellTokenId',
            type: 'decimal',
            precision: 86,
            scale: 0,
            isNullable: false,
            default: 0n,
          },
          {
            name: 'sellAmt',
            type: 'decimal',
            precision: 86,
            scale: 0,
            isNullable: false,
            default: 0n,
          },
          {
            name: 'nonce',
            type: 'decimal',
            precision: 86,
            scale: 0,
            isNullable: false,
            default: 0n,
          },
          {
            name: 'buyTokenId',
            type: 'decimal',
            precision: 86,
            scale: 0,
            isNullable: false,
            default: 0n,
          },
          {
            name: 'buyAmt',
            type: 'decimal',
            precision: 86,
            scale: 0,
            isNullable: false,
            default: 0n,
          },
          {
            name: 'accumulatedSellAmt',
            type: 'decimal',
            precision: 86,
            scale: 0,
            isNullable: false,
            default: 0n,
          },
          {
            name: 'accumulatedBuyAmt',
            type: 'decimal',
            precision: 86,
            scale: 0,
            isNullable: false,
            default: 0n,
          },
          {
            name: 'orderId',
            type: 'int8',
            isNullable: false,
            default: 0,
          },
        ],
        foreignKeys: [
          {
            name: 'obsOrderInfo',
            columnNames: ['orderId'],
            referencedColumnNames: ['id'],
            referencedTableName: 'ObsOrder',
            onDelete: 'RESTRICT',
            onUpdate: 'CASCADE',
          },
          {
            name: 'merkleTreeNode',
            columnNames: ['orderLeafId'],
            referencedColumnNames: ['leafId'],
            referencedTableName: 'ObsOrderLeafMerkleTreeNode',
            onDelete: 'RESTRICT',
            onUpdate: 'CASCADE',
          },
        ],
      }),
    );
    await queryRunner.createTable(
      new Table({
        name: 'MatchObsOrder',
        schema: 'public',
        columns: [
          {
            name: 'id',
            type: 'int8',
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'side',
            type: 'enum',
            enumName: 'SIDE',
            enum: [TsSide.BUY, TsSide.SELL],
            default: `'${TsSide.BUY}'`,
            isNullable: false,
          },
          {
            name: 'txId',
            type: 'int8',
            isNullable: true,
          },
          {
            name: 'txId2',
            type: 'int8',
            isNullable: true,
          },
          {
            name: 'referenceOrder',
            type: 'int8',
            isNullable: false,
          },
          {
            name: 'reqType',
            type: 'integer',
            isNullable: false,
            default: 0,
          },
          {
            name: 'marketPair',
            type: 'varchar',
            length: '100',
            default: '\'ETH/USDC\'',
            isNullable: false,
          },
          {
            name: 'matchedMQ',
            type: 'decimal',
            precision: 86,
            scale: 0,
            default: 0n,
          },
          {
            name: 'matchedBQ',
            type: 'decimal',
            precision: 86,
            scale: 0,
            default: 0n,
          },
          {
            name: 'timestamp',
            type: 'timestamp without time zone',
            precision: 3,
            isNullable: false,
            default: 'now()',
          },
          {
            name: 'orderStatus',
            type: 'integer',
            default: 1,
            isNullable: false,
          },
          {
            name: 'isVoid',
            type: 'boolean',
            default: false,
          },
          {
            name: 'isCancell',
            type: 'boolean',
            default: false,
          },
        ],
        foreignKeys: [
          {
            name: 'mainOrder',
            columnNames: ['referenceOrder'],
            referencedColumnNames: ['id'],
            referencedTableName: 'ObsOrder',
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT',
          },
          {
            name: 'matchedTx',
            columnNames: ['txId'],
            referencedColumnNames: ['txId'],
            referencedTableName: 'TransactionInfo',
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT',
          }
        ],
      }),
    );
    await queryRunner.createTable(
      new Table({
        name: 'CandleStick',
        schema: 'public',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'timestamp',
            type: 'timestamp without time zone',
            precision: 3,
            isNullable: false,
            default: 'now()',
          },
          {
            name: 'maxPrice',
            type: 'varchar',
            length: '300',
            isNullable: false,
            default: '0',
          },
          {
            name: 'minPrice',
            type: 'varchar',
            length: '300',
            isNullable: false,
            default: '0',
          },
          {
            name: 'openPrice',
            type: 'varchar',
            length: '300',
            isNullable: false,
            default: '0',
          },
          {
            name: 'closePrice',
            type: 'varchar',
            length: '300',
            isNullable: false,
            default: '0',
          },
          {
            name: 'volume',
            type: 'varchar',
            length: '300',
            isNullable: false,
            default: '0',
          },
          {
            name: 'marketPair',
            type: 'varchar',
            length: '300',
            isNullable: false,
            default: '\'ETH/USDC\'',
          },
        ],
      }),
    );
    await queryRunner.createTable(
      new Table({
        name: 'MarketPairInfo',
        schema: 'public',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isGenerated: true,
            isPrimary: true,
            generationStrategy: 'increment',
          },
          {
            name: 'mainTokenId',
            type: 'decimal',
            isNullable: false,
            precision: 86,
            scale: 0,
            default: 0n,
          },
          {
            name: 'baseTokenId',
            type: 'decimal',
            isNullable: false,
            precision: 86,
            scale: 0,
            default: 0n,
          },
          {
            name: 'marketPair',
            type: 'varchar',
            length: '100',
            isNullable: false,
            default: '\'ETH/USDC\'',
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('public.MarketPairInfo', true, true, true);
    await queryRunner.dropTable('public.CandleStick', true, true, true);
    await queryRunner.dropTable('public.MatchObsOrder', true, true, true);
    await queryRunner.dropTable('public.ObsOrderLeaf', true, true, true);
    await queryRunner.dropTable('public.ObsOrderLeafMerkleTreeNode', true, true, true);
    await queryRunner.dropTable('public.ObsOrder', true, true, true);
    await queryRunner.dropTable('public.TransactionInfo', true, true, true);
    await queryRunner.dropTable('public.BlockInformation', true, true, true);
    await queryRunner.dropTable('public.TokenLeafNode', true, true, true);
    await queryRunner.dropTable('public.TokenMerkleTreeNode', true, true, true);
    await queryRunner.dropTable('public.AccountLeafNode', true, true, true);
    await queryRunner.dropTable('public.AccountMerkleTreeNode', true, true, true);
    await queryRunner.dropTable('public.AccountInformation', true, true, true);
    await queryRunner.query('DROP TYPE "Role";');
    await queryRunner.query('DROP TYPE "BLOCK_STATUS"');
    await queryRunner.query('DROP TYPE "TX_STATUS";');
    await queryRunner.query('DROP TYPE "SIDE"');
  }
}
