import { BlockInformation } from '@common/ts-typeorm/account/blockInformation.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class BlockInformationServcie {
  constructor(
    @InjectRepository(BlockInformation)
    private readonly blockInformationRepository: Repository<BlockInformation>,
  ) {
  }
}