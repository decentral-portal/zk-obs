import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import {  } from '@ts-sdk/domain/lib/ts-types/ts-types';
// import { CircuitName } from 'common/ts-typeorm/src/account/blockInformation.entity';
import { TS_STATUS } from 'common/ts-typeorm/src/account/tsStatus.enum';
import { BlockInformationDto, BlockInformationPagination, BlockInformationWithTxDto, TransactionInfoDto } from '../dtos/block.dto';
import { PaginationDto } from '../dtos/common.dto';
import { BlockInformationServcie } from '../service/blockInfo.service';


@Controller('/block')
@ApiTags('block')
export class BlockInformationController {
  constructor(
    private readonly blockInfoService: BlockInformationServcie
  ) {

  }

  @Get('history')
  @ApiOperation({
    summary: 'get block history'
  })
  @ApiCreatedResponse({
    type: BlockInformationPagination,
  })
  async history(@Query() _dto: PaginationDto) {
    const defaultPagination = {
      pageNumber: 1,
      perPage: 10,
    };
    const dto = { ...defaultPagination, ..._dto };
    return await this.blockInfoService.getBlockInformations(dto);
  }

  @Get('latest')
  @ApiOperation({
    summary: 'get latest block info'
  })
  @ApiCreatedResponse({
    type: BlockInformationWithTxDto,
  })
  async latest() {
    return await this.blockInfoService.getLatestBlockInformation();
  }

  @Get(':blockNumber')
  @ApiOperation({
    summary: 'get specific block info'
  })
  @ApiCreatedResponse({
    type: BlockInformationWithTxDto,
  })
  async getBlock(@Param('blockNumber') blockNumber: number) {
    return await this.blockInfoService.getBlockInformationByBlockNumber(blockNumber);
  }

}

