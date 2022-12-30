import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MarketPairInfoRequestDto, MarketPairInfoResponseDto } from './dto/MarketPairInfo.dto';
import { MarketPairInfoEntity } from './marketPairInfo.entity';

@Injectable()
export class MarketPairInfoService {
  constructor(
    @InjectRepository(MarketPairInfoEntity)
    private readonly marketPairInfoRepository: Repository<MarketPairInfoEntity>,
  ) {}
  async findOneMarketPairInfo(marketPairDto: MarketPairInfoRequestDto): Promise<MarketPairInfoResponseDto> {
    const marketPairInfo = await this.marketPairInfoRepository.findOneOrFail({
      select: ['mainTokenId', 'baseTokenId', 'marketPair'],
      where: marketPairDto.pairs,
    });
    return marketPairInfo;
  }
}