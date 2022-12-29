import { toTsTokenAddressFromStr, toTsTxType } from '@common/ts-typeorm/account/dto/ts-type';
import { BadRequestException, Controller, Get, Logger, Param, Query } from '@nestjs/common';
import { L2BalanceRepository } from '../ports/L2Balance.repository';

@Controller('v1/ts/l2-real-balance')
export class L2RealBalanceController {
  private logger: Logger = new Logger(L2RealBalanceController.name);
  constructor(
    private readonly L2RealBalanceService: L2BalanceRepository,
  ) {}

  @Get()
  async getL2RealBalance(@Query('L2Address') L2Address: string, @Query('L2TokenAddrList') L2TokenAddrList: string[]): Promise<any> {
    if (L2Address === undefined || L2Address === '') {
      throw new BadRequestException('L2Address is not provided');
    }
    this.logger.debug(`getL2RealBalance: L2Address=${L2Address}, L2TokenAddrList=${L2TokenAddrList}`);
    if (L2TokenAddrList && L2TokenAddrList.length === 1) {
      L2TokenAddrList = [L2TokenAddrList[0]];
    }
    let l2TokenList = L2TokenAddrList ? L2TokenAddrList.map((item) => {
      return toTsTokenAddressFromStr(item);
    }): undefined;
    return this.L2RealBalanceService.getL2RealBalance({
      L2Address: L2Address,
      L2TokenAddrList: l2TokenList
    });
  }
}