// import { BadRequestException, Body, Controller, Get, Post, Query } from '@nestjs/common';
// import { CommandBus } from '@nestjs/cqrs';
// import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
// import { InjectRepository } from '@nestjs/typeorm';
// import { RollupCircuitType } from '@ts-sdk/domain/lib/ts-rollup/ts-rollup';
// import { PinoLogger } from 'nestjs-pino';
// import { Repository } from 'typeorm';
// import { TsTxAuctionLendRequest, TsTxAuctionBorrowRequest, TsTxAuctionCancelRequest } from '@ts-sdk/domain/lib/ts-types/ts-req-types';
// import { TsTxType, TsSystemAccountAddress, TsTokenAddress } from '@ts-sdk/domain/lib/ts-types/ts-types';
// import { AuctionBondTokenEntity } from '@common/ts-typeorm/auctionOrder/auctionBondToken.entity';
// import { PaginationDto } from '@ts-rollup-api/infrastructure/dtos/common.dto';
// import { BondTokensResponse, RollupAuctionBorrowDto, RollupAuctionCancelDto, RollupAuctionLendDto, RollupAuctionRecipt } from '@ts-rollup-api/infrastructure/dtos/transaction.dto';
// import { TsRollupService } from '@ts-rollup-api/infrastructure/service/rollup.service';


// @Controller('v1/ts/auction')
// @ApiTags('auction')
// export class TsAuctionController {

//   constructor(
//     readonly logger: PinoLogger,
//     private readonly tsRollupService: TsRollupService,
//     private readonly commandBus: CommandBus,
//     @InjectRepository(AuctionBondTokenEntity)
//     private auctionBondRepository: Repository<AuctionBondTokenEntity>,
//   ) { }

//   @Get('bonds')
//   @ApiOperation({})
//   @ApiCreatedResponse({
//     type: BondTokensResponse,
//   })
//   async getBondToken(@Query() dto: PaginationDto) {
//     return this.auctionBondRepository.find({
//       skip: dto.pageNumber * dto.perPage,
//     }); 
//   }

        
//   @Post('lend')
//   @ApiOperation({})
//   @ApiCreatedResponse({
//     type: RollupAuctionRecipt
//   })
//   async lend(@Body() dto: RollupAuctionLendDto) {
//     try { 
//       const txAuctionLendReq: TsTxAuctionLendRequest = {
//         reqType: TsTxType.AUCTION_LEND,
//         L2AddrFrom: dto.L2AddrFrom,
//         L2AddrTo: TsSystemAccountAddress.AUCTION_ADDR,
//         L2TokenAddrLending: dto.L2TokenAddrLending as TsTokenAddress,
//         lendingAmt: dto.lendingAmt,
//         nonce: dto.nonce,
//         maturityDate: dto.maturityDate,
//         expiredTime: dto.expiredTime,
//         interest: dto.interest,
//         eddsaSig: dto.eddsaSig,
//       };
//       const { blockNumber } = await this.tsRollupService.rollup
//         .startRollup(
//           async (rp, blockNumber) => {
//             rp.doTransaction(txAuctionLendReq);
//           }, RollupCircuitType.Transfer);
//       return {
//         blockNumber: blockNumber.toString(),
//       };
//     } catch (error: any) {
//       this.logger.error(error);
//       throw new BadRequestException(error.message);
//     }
//   }

//     @Post('borrow')
//     @ApiOperation({})
//     @ApiCreatedResponse({
//       type: RollupAuctionRecipt
//     })
//   async borrow(@Body() dto: RollupAuctionBorrowDto) {
//     try { 
//       const txAuctionBorrowReq: TsTxAuctionBorrowRequest = {
//         reqType: TsTxType.AUCTION_BORROW,
//         L2AddrFrom: dto.L2AddrFrom,
//         L2AddrTo: TsSystemAccountAddress.AUCTION_ADDR,
//         L2TokenAddrCollateral: dto.L2TokenAddrCollateral as TsTokenAddress,
//         collateralAmt: dto.collateralAmt,
//         nonce: dto.nonce,
//         maturityDate: dto.maturityDate,
//         expiredTime: dto.expiredTime,
//         interest: dto.interest,
//         L2TokenAddrBorrowing: dto.L2TokenAddrBorrowing as TsTokenAddress,
//         borrowingAmt: dto.borrowingAmt,
//         eddsaSig: dto.eddsaSig,
//       };
//       const { blockNumber } = await this.tsRollupService.rollup.startRollup(
//         async (rp, blockNumber) => {
//           rp.doTransaction(txAuctionBorrowReq);
//         }, RollupCircuitType.Transfer);
//       return {
//         blockNumber: blockNumber.toString(),
//       };
//     } catch (error: any) {
//       this.logger.error(error);
//       throw new BadRequestException(error.message);
//     }
//   }

//     @Post('cancel')
//     @ApiOperation({})
//     @ApiCreatedResponse({
//       type: RollupAuctionRecipt
//     })
//     async cancel(@Body() dto: RollupAuctionCancelDto) {
//       try { 
//         const txAuctionCancelReq: TsTxAuctionCancelRequest = {
//           reqType: TsTxType.AUCTION_CANCEL,
//           L2AddrFrom: TsSystemAccountAddress.AUCTION_ADDR,
//           L2AddrTo: dto.L2AddrTo,
//           L2TokenAddrRefunded: dto.L2TokenAddrRefunded as TsTokenAddress,
//           amount: dto.amount,
//           nonce: dto.nonce,
//           orderLeafId: dto.orderLeafId,
//           eddsaSig: dto.eddsaSig,
//         };
//         const { blockNumber} = await this.tsRollupService.rollup
//           .startRollup(
//             async (rp, blockNumber) => { rp.doTransaction(txAuctionCancelReq); },
//             RollupCircuitType.Transfer
//           );
//         return {
//           blockNumber: blockNumber.toString(),
//         };
//       } catch (error: any) {
//         this.logger.error(error);
//         throw new BadRequestException(error.message);
//       }
//     }
    
//     async getOrderList() {
//       return 'getOrderList';
//     }
// }