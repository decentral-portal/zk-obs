import { BlockInformation } from '@common/ts-typeorm/account/blockInformation.entity';
import { TransactionInfo } from '@common/ts-typeorm/account/transactionInfo.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlockInformationPagination, BlockInformationWithTxDto, TransactionInfoPagination } from '../dtos/block.dto';
import { PaginationDto } from '../dtos/common.dto';

@Injectable()
export class BlockInformationServcie {
  constructor(
    @InjectRepository(BlockInformation)
    private readonly blockInformationRepository: Repository<BlockInformation>,
    @InjectRepository(TransactionInfo)
    private readonly transactionInfoRepository: Repository<TransactionInfo>,
  ) {
  }
  async getTransactionInfoByBlockNumber(blockNumber: number, paginationDto: PaginationDto): Promise<TransactionInfoPagination> {
    const { pageNumber, perPage } = paginationDto;
    const queryBuilder = this.transactionInfoRepository.createQueryBuilder('transactionInfo');
    queryBuilder.where('transactionInfo.blockNumber = :blockNumber', { blockNumber });
    queryBuilder.orderBy('transactionInfo.transactionIndex', 'DESC');
    queryBuilder.skip((pageNumber - 1) * perPage);
    queryBuilder.take(perPage);
    const [list, total] = await queryBuilder.getManyAndCount();
    return {
      list: list.map(tx => ({
        txId: tx.txId.toString(),
        reqType: tx.reqType.toString(),
        blockNumber: tx.blockNumber == null? null :tx.blockNumber.toString(),
        accountId: tx.accountId.toString(),
        tokenId: tx.tokenId.toString(),
        accumulatedSellAmt: tx.accumulatedSellAmt.toString(),
        accumulatedBuyAmt: tx.accumulatedBuyAmt.toString(),
        amount: tx.amount.toString(),
        nonce: tx.nonce.toString(),
        arg0: tx.arg0.toString(),
        arg1: tx.arg1.toString(),
        arg2: tx.arg2.toString(),
        arg3: tx.arg3.toString(),
        arg4: tx.arg4.toString(),
        fee: tx.fee.toString(),
        feeToken: tx.feeToken.toString(),
        txStatus: tx.txStatus,
        metadata: tx.metadata,
      })),
      total,
      perPage: Number(perPage),
      pageNumber: Number(pageNumber),
      totalPage: Math.ceil(total / perPage),
    };
  }
  async getBlockInformations(paginationDto: PaginationDto): Promise<BlockInformationPagination> {
    const { pageNumber, perPage } = paginationDto;
    const queryBuilder = this.blockInformationRepository.createQueryBuilder('blockInformation');
    queryBuilder.orderBy('blockInformation.blockNumber', 'DESC');
    queryBuilder.skip((pageNumber - 1) * perPage);
    queryBuilder.take(perPage);
    const [list, total] = await queryBuilder.getManyAndCount();
    console.log('list',list);
    return {
      list: list.map(block => ({
        blockNumber: block.blockNumber,
        blockHash: block.blockHash,
        L1TransactionHash: block.L1TransactionHash,
        verifiedAt: block.verifiedAt.getTime().toString(),
        operatorAddress: block.operatorAddress,
        rawData: block.rawData,
        callData: block.callData,
        proof: block.proof,
        blockStatus: block.blockStatus,
      })),
      total,
      perPage: Number(perPage),
      pageNumber: Number(pageNumber),
      totalPage: Math.ceil(total / perPage),
    };
  }
  async getLatestBlockInformation(): Promise<BlockInformationWithTxDto> {
    const queryBuilder = this.blockInformationRepository.createQueryBuilder('blockInformation');
    queryBuilder.orderBy('blockInformation.blockNumber', 'DESC');
    queryBuilder.limit(1);
    const [block] = await queryBuilder.getMany();
    const transactions = await this.getTransactionInfoByBlockNumber(block.blockNumber, { pageNumber: 1, perPage: 10 });
    return {
      blockNumber: block.blockNumber,
      blockHash: block.blockHash,
      L1TransactionHash: block.L1TransactionHash,
      verifiedAt: block.verifiedAt.getTime().toString(),
      operatorAddress: block.operatorAddress,
      rawData: block.rawData,
      callData: block.callData,
      proof: block.proof,
      blockStatus: block.blockStatus,
      latest10txs: transactions.list,
      totalTxs: transactions.total,
    };
  }
  async getBlockInformationByBlockNumber(blockNumber: number): Promise<BlockInformationWithTxDto> {
    const queryBuilder = this.blockInformationRepository.createQueryBuilder('blockInformation');
    queryBuilder.where('blockInformation.blockNumber = :blockNumber', { blockNumber });
    const [block] = await queryBuilder.getMany();
    const transactions = await this.getTransactionInfoByBlockNumber(block.blockNumber, { pageNumber: 1, perPage: 10 });
    return {
      blockNumber: block.blockNumber,
      blockHash: block.blockHash,
      L1TransactionHash: block.L1TransactionHash,
      verifiedAt: block.verifiedAt.getTime().toString(),
      operatorAddress: block.operatorAddress,
      rawData: block.rawData,
      callData: block.callData,
      proof: block.proof,
      blockStatus: block.blockStatus,
      latest10txs: transactions.list,
      totalTxs: transactions.total,
    };
  }

}