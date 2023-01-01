import { AccountInformation as AccountInformationEntity } from '@common/ts-typeorm/account/accountInformation.entity';
import { AccountLeafNode } from '@common/ts-typeorm/account/accountLeafNode.entity';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccountInfoDto, AccountQueryDto } from '../dtos/accounts.dto';

@Injectable()
export class AccountInfoService {
  constructor(
    @InjectRepository(AccountInformationEntity)
    private readonly accountInfoRepo: Repository<AccountInformationEntity>,
    @InjectRepository(AccountLeafNode)
    private readonly accountLeafRepo: Repository<AccountLeafNode>,
  ) {}
  async getAccountInfo(dto: AccountQueryDto ): Promise<AccountInfoDto>{
    if (dto.L1Address == undefined && dto.accountId == undefined) {
      throw new BadRequestException('L1Address & accountId not provide');
    } 
    let query = {}
    if (dto.L1Address && !dto.accountId) {
      query = {
        L1Address: dto.L1Address
      }
    }
    if (dto.accountId && !dto.L1Address) {
      query = {
        accountId: dto.accountId
      }
    }
    const result = await this.accountInfoRepo.findOne({
      where: {
        ...query
      }
    });
    if (result == null) {
      throw new NotFoundException(`account not found`);
    }
    const nonceInfo = await this.accountLeafRepo.findOneBy({
      leafId: result.accountId
    });
    if (nonceInfo == null) {
      throw new NotFoundException(`nonce not found`);
    }
    return {
      L1Address: result.L1Address,
      accountId: result.accountId,
      nonce: nonceInfo.nonce.toString(),
      name: '',
      socialId: null,
      mail: result.email,
      createdTime: result.createdAt.getTime(),
      updatedTime: result.updatedAt.getTime()
    };    
  }
}