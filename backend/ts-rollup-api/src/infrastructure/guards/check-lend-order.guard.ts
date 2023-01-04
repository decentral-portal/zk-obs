import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { PinoLoggerService } from '@common/logger/adapters/real/pinoLogger.service';
// import { toTsTokenAddressFromStr, TsTokenAddress } from '@common/ts-typeorm/account/dto/ts-type';
import { L2BalanceRepository } from '@ts-rollup-api/infrastructure/ports/L2Balance.repository';
import { toTsTokenAddressFromStr } from '@ts-rollup-api/domain/entities/L2AccountInfo';
import { TsTokenAddress } from '@ts-sdk/domain/lib/ts-types/ts-types';

@Injectable()
export class CheckLendOrderGuard implements CanActivate {
  constructor(
    private readonly logger: PinoLoggerService, 
    private readonly l2BalanceService: L2BalanceRepository
  ) {
    this.logger.setContext('CheckLendOrderGuard');
  }
  async canActivate(context: ExecutionContext): Promise<boolean> { 
    const request = context.switchToHttp().getRequest();
    const body = await request.json();
    const {
      L2AddrFrom,
      L2TokenAddrLending,
      lendingAmt
    } = body;
    if (!L2AddrFrom || !L2TokenAddrLending || !lendingAmt || isNaN(L2TokenAddrLending)) {
      return false;
    }
    const targetLendingToken = toTsTokenAddressFromStr(L2TokenAddrLending);
    if (targetLendingToken == TsTokenAddress.Unknown) {
      return false;
    }
    try {
      const tokenInfos = await this.l2BalanceService.getL2RealBalance({
        accountId: L2AddrFrom,
        L2TokenAddrList: [targetLendingToken],
      });
      if (tokenInfos.list.length == 0) {
        return false;
      }
      const tokenInfo = tokenInfos.list[0];
      const requestLendingAmt = BigInt(lendingAmt);
      return requestLendingAmt < BigInt(tokenInfo.availableAmt);
    } catch (error) {
      console.log(error);
      return false;
    }
  }

}