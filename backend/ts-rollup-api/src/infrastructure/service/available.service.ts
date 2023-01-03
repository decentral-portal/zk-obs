import { AccountInformation } from '@common/ts-typeorm/account/accountInformation.entity';
import { AvailableViewEntity } from '@common/ts-typeorm/auctionOrder/availableView.entity';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { GetAvailableRequestDto, GetAvailableResponseDto } from '../dtos/getAvailable.dto';


@Injectable()
export class AvailableService {
  constructor(
    @InjectRepository(AvailableViewEntity)
    private readonly availableViewRepository: Repository<AvailableViewEntity>,
    @InjectRepository(AccountInformation)
    private readonly accountInfoRepository: Repository<AccountInformation>
  ) {}

  async getAvailableByAccountInfo(dto: GetAvailableRequestDto): Promise<GetAvailableResponseDto> {
    if ((dto.accountId == undefined || dto.accountId.length == 0 )&& 
    (dto.L1Address == undefined || dto.L1Address.length == 0) 
    ) {
      throw new BadRequestException('accountId or L1Address not provided');
    }
    let accountId = dto.accountId;
    if ((accountId == undefined || accountId.length == 0) && dto.L1Address.length != 0) {
      const accountInfo = await this.accountInfoRepository.findOne({
        select: ['accountId'],
        where: {
          L1Address: dto.L1Address
        }
      });
      if (accountInfo == null) {
        throw new NotFoundException(`L1Address ${dto.L1Address} not found`);
      }
      accountId = accountInfo.L1Address;
    }
    
    const result = (dto.L2TokenAddrs && dto.L2TokenAddrs.length !== 0)? 
    await this.availableViewRepository.find({
      where: {
        tokenId: In(dto.L2TokenAddrs),
        accountId: accountId
      }
    }):
    await this.availableViewRepository.find({
      where: {
        accountId: accountId
      }
    });
    return {
      list: result.map(item => ({
        tokenAddr: item.tokenId,
        amount: item.availableAmt.toString(),
        lockAmt: item.lockedAmt.toString()
      }))
    };
  }
}