import { TsWorkerName } from '@ts-sdk/constant';
import { PinoLoggerService } from '@common/logger/adapters/real/pinoLogger.service';
import { prove } from '@ts-prover/domain/prover-core';
import fs from 'fs';
import path from 'path';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { BlockInfomation } from 'common/ts-typeorm/src/account/blockInformation.entity';
import { Repository } from 'typeorm';
import { TS_STATUS } from '../../../common/ts-typeorm/src/account/tsStatus.enum';
import { BullWorker, BullWorkerProcess } from '@anchan828/nest-bullmq';
import { Job } from 'bullmq';
@BullWorker({queueName: TsWorkerName.PROVER})
export class ProverConsumer {
  constructor(
    private readonly config: ConfigService,
    private readonly logger: PinoLoggerService,
    @InjectRepository(BlockInfomation)
    private blockRepository: Repository<BlockInfomation>,
  // eslint-disable-next-line no-empty-function
  ) { }

  
  getCircuitInputPath(name: string) {
    return path.resolve(this.config.get('CIRCUIT_INPUT_PATH_BASE', ''), `./${name}-input.json`);
  }

  @BullWorkerProcess()
  async process(job: Job<BlockInfomation>) {
    this.logger.log(`ProverConsumer.process ${job.data.blockNumber}`);

    const { circuitInput } = job.data;
    const inputName = job.data.blockNumber.toString();
    const inputPath = this.getCircuitInputPath(inputName);
    fs.writeFileSync(inputPath, JSON.stringify(circuitInput));

    const { proofPath, publicPath } = await prove(inputName, inputPath, 'circuit');
    const proof = JSON.parse(fs.readFileSync(proofPath, 'utf8'));
    const publicInput = JSON.parse(fs.readFileSync(publicPath, 'utf8'));
    
    await this.blockRepository.update({
      blockNumber: job.data.blockNumber,
    },{
      status: TS_STATUS.L2CONFIRMED,
      proof,
      publicInput,
    });
    return true;
  }
}
