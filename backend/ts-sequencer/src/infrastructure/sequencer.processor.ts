import { TsWorkerName } from '@ts-sdk/constant';
import { PinoLoggerService } from '@common/logger/adapters/real/pinoLogger.service';
import { BullWorker, BullWorkerProcess } from '@anchan828/nest-bullmq';
import { Job } from 'bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { BlockInformation } from 'common/ts-typeorm/src/account/blockInformation.entity';
import { TransactionInfo } from 'common/ts-typeorm/src/account/transactionInfo.entity';
import { Repository } from 'typeorm';
import { TS_STATUS } from 'common/ts-typeorm/src/account/tsStatus.enum';

@BullWorker({
  queueName: TsWorkerName.SEQUENCER,
  options: {
    concurrency: 1
  }
})
export class SequencerConsumer {
  constructor(
    private readonly logger: PinoLoggerService,
    @InjectRepository(TransactionInfo)
    private txRepository: Repository<TransactionInfo>,
    @InjectRepository(BlockInformation)
    private blockRepository: Repository<BlockInformation>,

  ) {
    this.logger.log('SEQUENCER.process START');
  }
  @BullWorkerProcess({
    autorun: true,
  })
  async process(job: Job<TransactionInfo>) {
    this.logger.log(`SEQUENCER.process ${job.data.txId}`);
    // TODO: Sequencer process
    await this.txRepository.update({
      txId: job.data.txId,
    }, {
      tsStatus: TS_STATUS.PROCESSING
    });
    await delay(1000 * 1.5);
    await this.txRepository.update({
      txId: job.data.txId,
    }, {
      tsStatus: TS_STATUS.L2EXECUTED
    });
    return true;
  }
}

function delay(ms: number) {
  return new Promise( resolve => setTimeout(resolve, ms) );
}