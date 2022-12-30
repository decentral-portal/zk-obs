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
    console.log(marketPairDto);
    const marketPairInfo = await this.marketPairInfoRepository.findOneOrFail({
      select: ['mainTokenId', 'baseTokenId', 'marketPair'],
      where: [{
        mainTokenId: marketPairDto.pairs[0].mainTokenId,
        baseTokenId: marketPairDto.pairs[0].baseTokenId,
      }, {
        mainTokenId: marketPairDto.pairs[1].mainTokenId,
        baseTokenId: marketPairDto.pairs[1].baseTokenId,
      }]
    });
    return marketPairInfo;
  }
}