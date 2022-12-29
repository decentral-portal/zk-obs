import { TsTokenAddress } from '@common/ts-typeorm/account/dto/ts-type';
import { BadRequestException } from '@nestjs/common';
import { GetL2BalanceRequestDto } from '../dtos/getL2BalanceRequest.dto';
import { GetL2BalanceResponseDto } from '@ts-rollup-api/infrastructure/dtos/getL2BalanceResponse.dto';
import { L2BalanceRepository } from '@ts-rollup-api/infrastructure/ports/L2Balance.repository';

export class L2RealBalanceServiceFake implements L2BalanceRepository {
  realBalanceList =  [{
    L2Address: 100n,
    L2TokenAddr: TsTokenAddress.USDT,
    availableAmt: 100,
    lockedAmt: 0,
  },{
    L2Address: 100n,
    L2TokenAddr: TsTokenAddress.USDC,
    availableAmt: 10,
    lockedAmt: 60,
  }, {
    L2Address: 100n,
    L2TokenAddr: TsTokenAddress.DAI,
    availableAmt: 0,
    lockedAmt: 10,
  }];
  async getL2RealBalance(req: GetL2BalanceRequestDto): Promise<GetL2BalanceResponseDto> {
    if (req.L2Address === undefined) {
      throw new BadRequestException('L2Address is not provided');
    }
    // get L2TokenAddrList from req
    let L2TokenAddrList: TsTokenAddress[] = (req.L2TokenAddrList === undefined||req.L2TokenAddrList.length === 0) ? [
      TsTokenAddress.WETH,
      TsTokenAddress.WBTC,
      TsTokenAddress.USDT,
      TsTokenAddress.USDC,
      TsTokenAddress.DAI,
    ]: req.L2TokenAddrList;
    const result = this.realBalanceList.filter((item) => {
      return item.L2Address.toString() === req.L2Address && L2TokenAddrList.includes(item.L2TokenAddr);
    });
    return Promise.resolve({
      list: result.map((item) => {
        return {
          L2TokenAddr: item.L2TokenAddr.toString(),
          lockedAmt: item.lockedAmt.toString(),
          availableAmt: item.availableAmt.toString(),
        };
      })
    });
  } 
}