import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { PinoLoggerService } from '@common/logger/adapters/real/pinoLogger.service';
// import { toTsTokenAddressFromStr, TsTokenAddress } from ;
import { L2BalanceRepository } from '@ts-rollup-api/infrastructure/ports/L2Balance.repository';
import { toTsTokenAddressFromStr } from '@ts-rollup-api/domain/entities/L2AccountInfo';
import { TsTokenAddress } from '@ts-sdk/domain/lib/ts-types/ts-types';

@Injectable()
export class CheckWithdrawOrderGuard implements CanActivate {
  constructor(
    private readonly logger: PinoLoggerService,
    private readonly l2BalanceService: L2BalanceRepository 
  ) {
    this.logger.setContext('CheckWithdrawOrderGuard');
  }
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const body = await request.json();
    const {
      L2AddrFrom,
      L2TokenAddr,
      amount
    } = body;
    if (!L2AddrFrom || !L2TokenAddr || !amount || isNaN(amount) || isNaN(L2TokenAddr)) {
      return false;
    }
    const targetWithdrawToken = toTsTokenAddressFromStr(L2TokenAddr);
    if (targetWithdrawToken == TsTokenAddress.Unknown) {
      return false;
    }
    try {
      const tokenInfos = await this.l2BalanceService.getL2RealBalance({
        accountId: L2AddrFrom,
        L2TokenAddrList: [targetWithdrawToken],
      });
      if (tokenInfos.list.length == 0) {
        return false;
      }
      const tokenInfo = tokenInfos.list[0];
      const requestWithdrawAmt = BigInt(amount);
      return requestWithdrawAmt <= BigInt(tokenInfo.availableAmt);
    } catch (error) {
      this.logger.log(error);
      return false;
    }
  }
  
}