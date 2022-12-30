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

@Controller('v1/ts/transaction')
@ApiTags('Transaction')
export class TsTransactionController {

  constructor(
        readonly logger : PinoLogger,
        private readonly tsRollupService : TsRollupService,
        private readonly commandBus: CommandBus,
        // private readonly connection: Connection,
        private readonly marketPairInfoService: MarketPairInfoService
  ) {}

    @Post('register')
    @ApiOperation({})
    @ApiCreatedResponse({type: RollupTransferRecipt})
  async register(@Body()dto : RollupRegisterDto) {
    // TODO: check authentication for Operator
    try {
      const tokenInfo: TsTokenInfo = {
        tokenAddr: dto.L2TokenAddr,
        amount: BigInt(dto.amount),
        lockAmt: TsDefaultValue.BIGINT_DEFAULT_VALUE
      };
      const account = new TsRollupAccount(
        [tokenInfo],
        this.tsRollupService.rollup.config.token_tree_height,
        [
          BigInt(dto.tsPubKey[0]),
          BigInt(dto.tsPubKey[1])
        ],
      );
      const {blockNumber} = await this.tsRollupService.register(
        dto.L1Address, account
      );
      return {accountId: account.accountId.toString(), blockNumber: blockNumber.toString()};
    } catch (error : any) {
      this
        .logger
        .error(error);
      throw new BadRequestException(error.message);
    }
  }

    @Post('deposit')
    @ApiOperation({})
    @ApiCreatedResponse({type: RollupTransferRecipt})
    async deposit(@Body()dto : RollupDepositDto) {
      try {
        const req: TsTxDepositRequest = {
          reqType: TsTxType.DEPOSIT, L2AddrFrom: TsSystemAccountAddress.MINT_ADDR, L2AddrTo: dto.L2AddrTo, L2TokenAddr: dto.L2TokenAddr, amount: dto.amount,
          nonce: '0',
          eddsaSig: {
            R8: ['', ''],
            S: ''
          }
        };
        const {blockNumber} = await this
          .tsRollupService
          .rollup
          .startRollup(async (rp, blockNumber) => {
            rp.doTransaction(req);
          }, RollupCircuitType.Transfer);
        return {blockNumber: blockNumber.toString()};
      } catch (error : any) {
        this
          .logger
          .error(error);
        throw new BadRequestException(error.message);
      }
    }

    @Post('transfer')
    @ApiOperation({})
    // @UseGuards(AuthenticationGuard)
    // @ApiBearerAuth()
    @ApiCreatedResponse({type: RollupTransferRecipt})
    async transfer(@Body()dto : RollupTransferDto) {
      try {
        const txTransferReq: TsTxTransferRequest = {
          reqType: TsTxType.TRANSFER,
          L2AddrFrom: dto.L2AddrFrom,
          L2AddrTo: dto.L2AddrTo,
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
            rp.doTransaction(txTransferReq);
          }, RollupCircuitType.Transfer);
        return {blockNumber: blockNumber.toString()};
      } catch (error : any) {
        this
          .logger
          .error(error);
        throw new BadRequestException(error.message);
      }
    }

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
      })
    }
}