import {
  Body,
  Controller,
  Post,
  BadRequestException
} from '@nestjs/common';
import {CommandBus} from '@nestjs/cqrs';
import {
  ApiCreatedResponse,
  ApiOperation,
  ApiTags} from '@nestjs/swagger';
import {RollupDepositDto, RollupRegisterDto, RollupTransferDto, RollupTransferRecipt, RollupWithdrawDto} from '../dtos/transaction.dto';
import {TsRollupService} from '../service/rollup.service';
import {PinoLogger} from 'nestjs-pino';
import { TsDefaultValue, TsSystemAccountAddress, TsTokenInfo, TsTxType } from '@ts-sdk/domain/lib/ts-types/ts-types';
import { TsRollupAccount } from '@ts-sdk/domain/lib/ts-rollup/ts-account';
import { TsTxDepositRequest, TsTxTransferRequest, TsTxWithdrawRequest } from '@ts-sdk/domain/lib/ts-types/ts-req-types';
import { RollupCircuitType } from '@ts-sdk/domain/lib/ts-rollup/ts-rollup';
import { PlaceOrderRequest } from '../dtos/PlaceOrderRequest.dto';
import { TsTxType as SecondTxType } from '@ts-rollup-api/domain/value-objects/tsTxType.enum';
import { PlaceOrderResponseDto } from '../dtos/PlaceOrderResponse.dto';
import { Connection } from 'typeorm';
import { MarketPairInfoService } from '@common/ts-typeorm/auctionOrder/marketPairInfo.service';
import { TsSide } from '@common/ts-typeorm/auctionOrder/tsSide.enum';
import { ObsOrderEntity } from '@common/ts-typeorm/auctionOrder/obsOrder.entity';
import { RegisterRequestDto } from '../dtos/RegisterRequest.dto';

@Controller('v1/ts/transaction')
@ApiTags('Transaction')
export class TsTransactionController {

  constructor(
        readonly logger : PinoLogger,
        private readonly tsRollupService : TsRollupService,
        private readonly commandBus: CommandBus,
        private readonly marketPairInfoService: MarketPairInfoService,
        private readonly connection: Connection,
  ) {}
    @Post('withdraw')
    @ApiOperation({})
    // @UseGuards(AuthenticationGuard)
    // @ApiBearerAuth()
    @ApiCreatedResponse({type: RollupTransferRecipt})
    async withdraw(@Body()dto : RollupWithdrawDto) {
      try {
        const txWithdrawReq: TsTxWithdrawRequest = {
          reqType: TsTxType.WITHDRAW,
          L2AddrFrom: dto.L2AddrFrom,
          L2AddrTo: TsSystemAccountAddress.WITHDRAW_ADDR,
          L2TokenAddr: dto.L2TokenAddr,
          amount: dto.amount,
          nonce: dto
            .nonce
            .toString(),
          eddsaSig: dto.eddsaSig
        };
        const {blockNumber} = await this
          .tsRollupService
          .rollup
          .startRollup(async (rp, blockNumber) => {
            rp.doTransaction(txWithdrawReq);
          }, RollupCircuitType.Transfer);
        return {blockNumber: blockNumber.toString()};
      } catch (error : any) {
        this
          .logger
          .error(error);
        throw new BadRequestException(error.message);
      }
    }

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
      const result = await this.connection.getRepository(ObsOrderEntity).insert({
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
      const orderId = result.generatedMaps[0].id;
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
    };
}