import {
  Body,
  Controller,
  Post,
  BadRequestException,
  Get,
  Param,
  NotFoundException
} from '@nestjs/common';
import {CommandBus} from '@nestjs/cqrs';
import {
  ApiCreatedResponse,
  ApiOperation,
  ApiTags} from '@nestjs/swagger';
// import {RollupDepositDto, RollupRegisterDto, RollupTransferDto, RollupTransferRecipt, RollupWithdrawDto} from '../dtos/transaction.dto';
import {PinoLogger} from 'nestjs-pino';
// import { TsTxDepositRequest, TsTxTransferRequest, TsTxWithdrawRequest } from '@ts-sdk/domain/lib/ts-types/ts-req-types';
import { PlaceOrderRequest } from '../dtos/PlaceOrderRequest.dto';
import { TsTxType as SecondTxType } from '@ts-sdk/domain/lib/ts-types/ts-types';
import { PlaceOrderResponseDto } from '../dtos/PlaceOrderResponse.dto';
import { Connection } from 'typeorm';
import { MarketPairInfoService } from '@common/ts-typeorm/auctionOrder/marketPairInfo.service';
import { TsSide } from '@common/ts-typeorm/auctionOrder/tsSide.enum';
import { ObsOrderEntity } from '@common/ts-typeorm/auctionOrder/obsOrder.entity';
import { TransactionInfo } from '@common/ts-typeorm/account/transactionInfo.entity';
import { GetTransactionResponseDto } from '../dtos/transactionInfo.dto';
import { AccountLeafNode } from '@common/ts-typeorm/account/accountLeafNode.entity';
import { AvailableService } from '../service/available.service';
import { TokenInfo } from '../dtos/getAvailable.dto';

@Controller('v1/ts/transaction')
@ApiTags('Transaction')
export class TsTransactionController {

  constructor(
        readonly logger : PinoLogger,
        private readonly commandBus: CommandBus,
        private readonly marketPairInfoService: MarketPairInfoService,
        private readonly connection: Connection,
        private readonly availableService: AvailableService
  ) {}
    @Post('placeOrder')
    @ApiOperation({})
    @ApiCreatedResponse({type: PlaceOrderResponseDto})
  async placeOrder(@Body()dto : PlaceOrderRequest) {
    // check reqType TsTxType.MARKET_ORDER buyAmt should be '0'
    if (dto.reqType === SecondTxType.SecondMarketOrder  && dto.buyAmt !== '0') {
      throw new BadRequestException('buyAmt should be 0 for market order');
    }
    // generate MarketPair query Pair
    const queryPair = [
      { mainTokenId: dto.sellTokenId, baseTokenId: dto.buyTokenId },
      { mainTokenId: dto.buyTokenId, baseTokenId: dto.sellTokenId },
    ];
      // query marketPair by sellTokenId and buyTokenId
    const marketPairInfo = await this.marketPairInfoService.findOneMarketPairInfo({
      pairs: queryPair
    });
    const side = marketPairInfo.mainTokenId === dto.buyTokenId ? TsSide.BUY : TsSide.SELL;
    const mainQty = side === TsSide.BUY ? dto.buyAmt : dto.sellAmt;
    const baseQty = side === TsSide.BUY ? dto.sellAmt : dto.buyAmt;
    const remainMainQty = mainQty;  
    const remainBaseQty = baseQty;
    const mainTokenId = marketPairInfo.mainTokenId;
    const baseTokenId = marketPairInfo.baseTokenId;
    const price = (dto.reqType === SecondTxType.SecondMarketOrder)?
      '0': (Number(mainQty)/Number(baseQty)).toString();
    const formatPrice = this.toFixed8(price);
    const nonce = dto.nonce.toString();
    let txInfo = {
      reqType: Number(dto.reqType),
      accountId: BigInt(dto.sender),
      nonce: BigInt(nonce),
      amount: BigInt(dto.sellAmt),
      tokenId: BigInt(dto.sellTokenId),
      arg2: BigInt(dto.buyTokenId),
      arg3: 0n,
    };
    if (dto.reqType === SecondTxType.SecondMarketOrder) {
      txInfo['arg3'] = BigInt(dto.buyAmt);
    }
    console.log(txInfo);
    const [accoutLeaf, currentAvailable] = await Promise.all([
      this.connection.getRepository(AccountLeafNode).findOne({ 
        where: {
          leafId: dto.sender 
        }
      }),
      this.availableService.getAvailableByAccountInfo({
        accountId: dto.sender,
        L1Address: '',
        L2TokenAddrs: []
      })
    ]);
    if (!accoutLeaf) {
      console.log('account not exist');
      throw new BadRequestException('account not exist');
    }
    const targetTokenInfo = currentAvailable.list.find((item: TokenInfo) => item.tokenAddr === dto.sellTokenId);
    if (!targetTokenInfo || BigInt(targetTokenInfo.amount) < BigInt(dto.sellAmt)) {
      console.log('not enough availabe balance', targetTokenInfo, dto.sellAmt);
      throw new BadRequestException('not enough availabe balance');
    }
    console.log(accoutLeaf);
    const orderId = await this.connection.transaction(async (manager) => { 
      const txInfoEntity = new TransactionInfo();
      txInfoEntity.reqType = txInfo.reqType;
      txInfoEntity.accountId = txInfo.accountId;
      txInfoEntity.nonce = txInfo.nonce;
      txInfoEntity.amount = txInfo.amount;
      txInfoEntity.tokenId = txInfo.tokenId;
      txInfoEntity.arg2 = txInfo.arg2;
      txInfoEntity.arg3 = txInfo.arg3;
      const txResult = await manager.getRepository(TransactionInfo).save(txInfoEntity);
      const result = await manager.getRepository(ObsOrderEntity).insert({
        txId: txResult.txId,
        reqType: Number(dto.reqType),
        accountId: BigInt(dto.sender),
        side,
        mainTokenId: BigInt(mainTokenId),
        baseTokenId: BigInt(baseTokenId),
        mainQty: BigInt(mainQty),
        baseQty: BigInt(baseQty),
        remainMainQty: BigInt(remainMainQty),
        remainBaseQty: BigInt(remainBaseQty),
        price: formatPrice,
      });
      await manager.getRepository(AccountLeafNode).update({
        leafId: dto.sender
      }, {
        nonce: BigInt(accoutLeaf.nonce) + 1n
      });
      const orderId = result.generatedMaps[0].id;
      return orderId;
    });
    return {
      orderId: orderId.toString()
    };
  }
    toFixed8(num: string) {
      let s = '' + num;
      if (s.indexOf('.') === -1) {
        s += '.';
      }
      s += '00000000';
      return s.substring(0, s.indexOf('.') + 9);
    }
  @Get(':txId')
  @ApiOperation({
    summary: 'get transaction Info by txId'
  })
  @ApiCreatedResponse({ type: GetTransactionResponseDto})
    async getTransactionInfoByTxId(@Param('txId') txId: string): Promise<GetTransactionResponseDto> {
      console.log(txId);
      if (Number.isNaN(txId)|| txId.length == 0 || txId == undefined) {
        throw new BadRequestException('txId is not provide');
      }
      const result = await this.connection.getRepository(TransactionInfo).findOne({
        where: {
          txId: Number(txId)
        }
      });
      if (result == null) {
        throw new NotFoundException(`transaction with ${txId} not found`);
      }
      return {
        txId: result.txId.toString(),
        reqType: result.reqType.toString(),
        blockNumber: (result.blockNumber == null)? null : result.blockNumber.toString(), 
        accountId: result.accountId.toString(),
        accumulatedBuyAmt: result.accumulatedBuyAmt.toString(),
        accumulatedSellAmt: result.accumulatedSellAmt.toString(),
        amount: result.amount.toString(),
        arg0: result.arg0.toString(),
        arg1: result.arg1.toString(),
        arg2: result.arg2.toString(),
        arg3: result.arg3.toString(),
        arg4: result.arg4.toString(),
        tokenId: result.tokenId.toString(),
        fee: result.fee.toString(),
        feeToken: result.feeToken.toString(),
        nonce: result.nonce.toString(),
        txStatus: result.txStatus.toString()
      };
    }
}