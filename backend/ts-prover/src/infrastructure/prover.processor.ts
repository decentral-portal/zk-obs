import { TsWorkerName } from '@ts-sdk/constant';
import { PinoLoggerService } from '@common/logger/adapters/real/pinoLogger.service';
import { prove } from '@ts-prover/domain/prover-core';
import fs from 'fs';
import path from 'path';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { BlockInformation } from 'common/ts-typeorm/src/account/blockInformation.entity';
import { Repository } from 'typeorm';
// import { TS_STATUS } from '../../../common/ts-typeorm/src/account/tsStatus.enum';
import { BullWorker, BullWorkerProcess } from '@anchan828/nest-bullmq';
import { Job } from 'bullmq';
import { BLOCK_STATUS } from '@common/ts-typeorm/account/blockStatus.enum';
@BullWorker({queueName: TsWorkerName.PROVER})
export class ProverConsumer {
  private circuitName = 'circuit';
  constructor(
    private readonly config: ConfigService,
    private readonly logger: PinoLoggerService,
    @InjectRepository(BlockInformation)
    private blockRepository: Repository<BlockInformation>,
  // eslint-disable-next-line no-empty-function
  ) {
    this.circuitName = this.config.getOrThrow<string>('CIRCUIT_NAME');
  }

  
  getCircuitInputPath(name: string) {
    return path.resolve(this.config.get('CIRCUIT_INPUT_PATH_BASE', ''), `./${name}-input.json`);
  }

  @BullWorkerProcess()
  async process(job: Job<BlockInformation>) {
    this.logger.log(`ProverConsumer.process ${job.data.blockNumber}`);
    const currentBlock = await this.blockRepository.findOne({
      where: {
        blockStatus: BLOCK_STATUS.L2EXECUTED
      },
      order: {
        blockNumber: 'ASC'
      }
    });
    if(!currentBlock) {
      this.logger.log(`ProverConsumer.process ${job.data.blockNumber} no block found`);
      return false;
    }

    const inputName = `block-${currentBlock.blockNumber}`;
    const inputPath = this.getCircuitInputPath(inputName);
    if(!currentBlock.rawData) {
      this.logger.log(`ProverConsumer.process ${job.data.blockNumber} rawData not found`);
      return false;
    }
    fs.writeFileSync(inputPath, currentBlock.rawData);

    const { proofPath, publicPath } = await prove(inputName, inputPath, this.circuitName);
    const proof = JSON.parse(fs.readFileSync(proofPath, 'utf8'));
    // const publicInput = JSON.parse(fs.readFileSync(publicPath, 'utf8'));
    // await verify(publicPath, proofPath, vKetPath, item.circuitName);
    // await genSolidityCalldata(item.name, proofPath, publicPath, item.circuitName);
    await this.blockRepository.update({
      blockNumber: job.data.blockNumber,
    },{
      blockStatus: BLOCK_STATUS.L2CONFIRMED,
      proof,
    });
    return true;
  }
}
