import { BadRequestException, Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { TsTokenAddress } from '@ts-sdk/domain/lib/ts-types/ts-types';
import { AccountBalanceQueryDto, AccountQueryDto, AccountLoginDto, AccountLoginHistoryQueryDto, AccountPreLoginDto, AccountPreLoginResponse, AccountUpdateDto, AccountTxHistoryDto, AccountLoginResponse, AccountBalanceResponse, AccountInfoResponse, L2TransactionHistoryResponse, AccountLoginHistoryResponse } from '../dtos/accounts.dto';
import { GetAvailableRequestDto, GetAvailableResponseDto } from '../dtos/getAvailable.dto';
import { AvailableService } from '../service/available.service';
// import { TsRollupService } from '../service/rollup.service';

@Controller('v1/ts/account')
@ApiTags('Account')
export class TsAccountController {
  constructor(
    private readonly availableService: AvailableService
  ) {}
  // constructor(
  //   // private readonly tsRollupService: TsRollupService,
  // ) { }

  //   @Post('pre-login')
  //   @ApiOperation({
  //     summary: 'TODO',
  //   })
  //   @ApiCreatedResponse({
  //     type: AccountPreLoginResponse,
  //   })
  // async preLogin(@Query() dto: AccountPreLoginDto): Promise<AccountPreLoginResponse> {
  //   return {
  //     L1Address: dto.L1Address,
  //     expiredTime: Date.now() + 1000 * 60 * 5,
  //     salt: Math.round(Math.random() * 10 ** 10).toString(),
  //   };
  // }

    // @Post('wallet-login')
    // @ApiOperation({
    //   summary: 'TODO',
    //   description: 'login via ECDSA signature',
    // })
    // @ApiCreatedResponse({
    //   type: AccountLoginResponse,
    // })
    // async walletLogin(@Body() dto: AccountLoginDto) {
    //   return 'login';
    // }

    @Get('available')
    @ApiOperation({
      summary: 'get L2 available list',
    })
    @ApiCreatedResponse({
      type: GetAvailableResponseDto,
    })
    async getAvailable(@Query() dto: GetAvailableRequestDto) {
      return await this.availableService.getAvailableByAccountInfo(dto);
    }

    @Get('profile')
    @ApiOperation({
      summary: 'TODO: get personal profile'
    })
    @ApiCreatedResponse({
      type: AccountInfoResponse,
    })
    async getAccountInfo(@Query() dto: AccountQueryDto) {
    //   if(dto.accountId || dto.L1Address) {
    //     try {
    //       const acc = dto.accountId
    //         ? this.tsRollupService.rollup.getAccount(BigInt(dto.accountId))
    //         : this.tsRollupService.getAccountFromL1Address(dto.L1Address ?? '');
    //       return {
    //         // L1Address: this.tsRollupService.getL1AddressFromaccountId(acc?.accountId.toString()) ?? '?',
    //         // accountId: acc?.accountId.toString(),
    //         nonce: acc?.nonce.toString(),
    //         // tokenLeafs: acc?.tokenLeafs.map((t: any) => ({
    //         //   tokenAddr: t.tokenAddr.toString(),
    //         //   amount: t.amount.toString(),
    //         // })),
    //         tokenTreeRoot: acc?.tokenTree.getRoot(),
    //         // tsPubKey: acc?.tsPubKey.map((t: any) => t.toString()),
    //         tokenTreeSize: acc?.tokenTreeSize.toString(),
    //       };
    //     } catch(error: any) {
    //       throw new BadRequestException(error.message);
    //     }
    //   }
    //   throw new BadRequestException('accountId or L1Address is required');
    }

    // @Post('update-profile')
    // @ApiOperation({
    //   summary: 'TODO',
    // })
    // @ApiOkResponse()
    // async updateAccountInfo(@Body() dto: AccountUpdateDto) {
    // }

    // @Get('login-history')
    // @ApiOperation({
    //   summary: 'TODO',
    // })
    // @ApiCreatedResponse({
    //   type: AccountLoginHistoryResponse,
    // })
    // async getLoginHistory(@Query() dto: AccountLoginHistoryQueryDto) {
    //   return 'getLoginHistory';
    // }

    // @Get('tx-history')
    // @ApiOperation({
    //   summary: 'TODO',
    // })
    // @ApiCreatedResponse({
    //   type: L2TransactionHistoryResponse,
    // })
    // async getL2TransactionHistory(@Query() dto: AccountTxHistoryDto) {
    //   return 'getL2TransactionHistory';
    // }

    
}
