import { AccountInformation } from '@common/ts-typeorm/account/accountInformation.entity';
import { TokenLeafNode } from '@common/ts-typeorm/account/tokenLeafNode.entity';
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
    private readonly accountInfoRepository: Repository<AccountInformation>,
    @InjectRepository(TokenLeafNode)
    private readonly tokenLeafNodeRepository: Repository<TokenLeafNode>
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
    const txBasicResult = (dto.L2TokenAddrs && dto.L2TokenAddrs.length !== 0)? 
    await this.tokenLeafNodeRepository.find({
      select: ['leafId', 'availableAmt', 'lockedAmt'],
      where: {
        leafId: In(dto.L2TokenAddrs),
        accountId: accountId
      }
    }):
    await this.tokenLeafNodeRepository.find({
      select: ['leafId', 'availableAmt', 'lockedAmt'],
      where: {
        accountId: accountId
      }
    });
    return (result.length == 0)? {
      list: txBasicResult.map(item => ({
        tokenAddr: item.leafId,
        amount: item.availableAmt.toString(),
        lockAmt: item.lockedAmt.toString()
      }))
    } : {
      list: txBasicResult.map(item => {
        const available = result.find(item2 => item2.tokenId == item.leafId);
        if (available != undefined) {
          return {
            tokenAddr: item.leafId,
            amount: available.availableAmt.toString(),
            lockAmt: available.lockedAmt.toString()
          }
        } else {
          return {
            tokenAddr: item.leafId,
            amount: item.availableAmt.toString(),
            lockAmt: item.lockedAmt.toString()
          }
        }
      })
    }
  }
}