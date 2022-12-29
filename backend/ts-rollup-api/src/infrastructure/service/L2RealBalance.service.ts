import { TsTokenAddress } from '@common/ts-typeorm/account/dto/ts-type';
import { AuctionL2RealBalanceViewEntity } from '@common/ts-typeorm/auctionOrder/auctionL2RealBalanceView.entity';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GetL2BalanceRequestDto } from '@ts-rollup-api/infrastructure/dtos/getL2BalanceRequest.dto';
import { GetL2BalanceResponseDto } from '@ts-rollup-api/infrastructure/dtos/getL2BalanceResponse.dto';
import { L2BalanceRepository } from '@ts-rollup-api/infrastructure/ports/L2Balance.repository';
import { In, Repository } from 'typeorm';
@Injectable()
export class L2RealBalanceService implements L2BalanceRepository {
  private logger: Logger = new Logger(L2RealBalanceService.name);
  constructor(@InjectRepository(AuctionL2RealBalanceViewEntity) 
  private readonly auctionL2RealBalanceRepository: Repository<AuctionL2RealBalanceViewEntity>) {
    this.logger.debug('L2RealBalanceService constructor');
  }
  async getL2RealBalance(req: GetL2BalanceRequestDto): Promise<GetL2BalanceResponseDto> {
    // check req
    if (req.L2Address === undefined) {
      throw new BadRequestException('L2Address is not provided');
    }
    // get L2TokenAddrList from req
    let L2TokenAddrList: TsTokenAddress[] = (req.L2TokenAddrList === undefined || req.L2TokenAddrList.length === 0) ? [
      TsTokenAddress.WETH,
      TsTokenAddress.WBTC,
      TsTokenAddress.USDT,
      TsTokenAddress.USDC,
      TsTokenAddress.DAI,
    ]: req.L2TokenAddrList;

    // get L2RealBalance from db
    const result = await this.auctionL2RealBalanceRepository.find({
      where: {
        L2Address: req.L2Address,
        L2TokenAddr: In(L2TokenAddrList)
      },
    });
    
    return {
      list: result.map((item) => {
        return {
          L2TokenAddr: item.L2TokenAddr.toString(),
          lockedAmt: item.lockedAmt.toString(),
          availableAmt: item.availableAmt.toString(),
        };
      })
    };
  }
  
}