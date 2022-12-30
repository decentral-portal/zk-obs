import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { TsTxType } from '@ts-sdk/domain/lib/ts-types/ts-types';
// import { CircuitName } from 'common/ts-typeorm/src/account/blockInformation.entity';
import { TS_STATUS } from 'common/ts-typeorm/src/account/tsStatus.enum';
import { BlockInformationDto, BlockInformationPagination, BlockInformationWithTxDto, TransactionInfoDto } from '../dtos/block.dto';
import { PaginationDto } from '../dtos/common.dto';

const exampleblocks = new Array(1024).fill(0).map((_, i) => getexampleBlockWithTxs(i + 1)).reverse();

@Controller('/block')
@ApiTags('block')
export class BlockInformationController {
  constructor(
  ) {

  }

  @Get('history')
  @ApiOperation({
  })
  @ApiCreatedResponse({
    type: BlockInformationPagination,
  })
  history(@Query() _dto: PaginationDto) {
    const defaultPagination = {
      pageNumber: 1,
      perPage: 10,
    };
    const dto = { ...defaultPagination, ..._dto };
    const result: BlockInformationPagination = {
      list: exampleblocks.slice((dto.pageNumber - 1) * dto.perPage, dto.pageNumber * dto.perPage),
      total: exampleblocks.length,
      perPage: dto.perPage,
      pageNumber: dto.pageNumber,
      totalPage: Math.ceil(exampleblocks.length / dto.perPage),
    }; 
    return result;
  }

  @Get('latest')
  @ApiOperation({
  })
  @ApiCreatedResponse({
    type: BlockInformationWithTxDto,
  })
  latest(): BlockInformationWithTxDto {
    return exampleblocks[0];
  }

  @Get(':blockNumber')
  @ApiOperation({
  })
  @ApiCreatedResponse({
    type: BlockInformationWithTxDto,
  })
  getBlock(@Param('blockNumber') blockNumber: string): BlockInformationWithTxDto {
    return exampleblocks.find(b => b.blockNumber === Number(blockNumber))!;

  }

}

function getexampleBlockWithTxs(blockNumber: number, batchSize = 10): BlockInformationWithTxDto {
  return {
    ...getExampleBlock(blockNumber, batchSize),
    txs: new Array(batchSize).fill(0).map((_, i) => getExampleTx(i + 1 + blockNumber * batchSize, blockNumber)).reverse(),
  };
}

function getExampleBlock(blockNumber: number, batchSize = 10): BlockInformationDto {
  return {
    blockNumber,
    circuitName: 'NORMAL',
    startTxId: 1 + blockNumber * batchSize,
    endTxId: 1024 + blockNumber * batchSize,
    publicCalldata: '0x0baba1ad5be3a5c0a66e7ac838a129bf948f1ea418948688e35d08c2ec66c8b3ceeb9e9b02e76b04e72d1aa0458953095780bf1a023275b98c38783887cabe9472662f762c595206c729dc8872f6efa89c50c2786397ec1e00000000000e000027110800000194bf81520001798d000000000000000000000001000001b7000800000194bf81530001798d000000000000000000000001000001b900030000024fba00020555811500000300005365000000d5000000000000030000024fba00029ba7811500000300005365000000d700000000000003000002e5e40001f86d800b0000010000536500000001000000000000040000031c000000000001e69e000165ac00008b7c5668a00000019809030000026047000165ac00004e68a000000000000b9195000000000000040000031e000000000001e69e000165ac00008c055668a00000019814030000026047000165ac00004e68a000000000000b919700000000000001916168c1aa9892b2845542bfb2fba4716ffd5d5e00038d79000000000800000194bf81540001798d000000000000000000000001000001bb00030000024fba000282ac811500000300005365000000d9000000000000030000024fba00029ec5811500000300005365000000db000000000000030000024fba00021e61811500000300005365000000dd000000000000030000024fba000148c78115000003000053cb000000df0000000000000501916168c1aa9892b2845542bfb2fba4716ffd5d5e00038d790000600800000194bf8155000179bc000000000000000000000001000001bd00030000024fba0003a2508115000003000053cb000000e100000000000003000001f86d00019d2280e4000001000053cb000000010000000000000300000191c20001f437889a000001000171ed00000001000000000000030000021f7e0003a5a08064000002000053cb0000000300000000000003000001e87900038d798003000001000171ed0000519b0000000000000800000194bf8156000179bc000000000000000000000001000001bf000800000194bf8157000179bc000000000000000000000001000001c100030000024fba0002e70d8115000003000053cb000000e3000000000000',
    proof: {},
    oldStateRoot: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    newStateRoot: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    L2CommittedAt: new Date().getTime(),
    L1VerifiedTxHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    L1VerifiedAt: new Date().getTime(),
    status: TS_STATUS.PENDING,
  };
}

function getExampleTx(txId: number, blockNumber: number) {
  return {
    txId,
    blockNumber,
    reqType: TsTxType.AUCTION_BORROW,
    L2AddrFrom: getRandomInt().toString(),
    L2AddrTo: getRandomInt().toString(),
    L2TokenAddr: getRandomInt().toString(),
    amount: getRandomInt(10000000).toString(),
    nonce: getRandomInt(),
    arg0: null,
    arg1: null,
    arg2: null,
    arg3: null,
    arg4: null,
    fee: getRandomInt().toString(),
    feeToken: getRandomInt().toString(),
    metadata: {},
    txStatus: TS_STATUS.PENDING,
  };
}

function getRandomInt(max = 1000) {
  return Math.floor(Math.random() * Math.floor(max));
}

function mergeObject<T>(A: any, B: any): T {
  const res: any = {};
  Object.keys({...A,...B}).map(key => {
    res[key] = B[key] || A[key];
  });
  return res as T;
}