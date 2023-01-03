import { TsWorkerName } from '@ts-sdk/constant';
import { PinoLoggerService } from '@common/logger/adapters/real/pinoLogger.service';
import { BullWorker, BullWorkerProcess, BullQueueInject } from '@anchan828/nest-bullmq';
import { Job, Queue } from 'bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { BlockInformation } from 'common/ts-typeorm/src/account/blockInformation.entity';
import { TransactionInfo } from 'common/ts-typeorm/src/account/transactionInfo.entity';
import { Repository } from 'typeorm';
import { TS_STATUS } from 'common/ts-typeorm/src/account/tsStatus.enum';
import { TsRollupService } from '@ts-rollup-api/infrastructure/service/rollup.service';

@BullWorker({
  queueName: TsWorkerName.SEQUENCER,
  options: {
    concurrency: 1,
  },
})
export class SequencerConsumer {
  constructor(
    private readonly logger: PinoLoggerService,
    @InjectRepository(TransactionInfo)
    private txRepository: Repository<TransactionInfo>,
    @InjectRepository(BlockInformation)
    private blockRepository: Repository<BlockInformation>,
    private readonly rollupService: TsRollupService,
  ) {
    this.logger.log('SEQUENCER.process START');
  }
  @BullWorkerProcess({
    autorun: true,
  })
  async process(job: Job<TransactionInfo>) {
    this.logger.log(`SEQUENCER.process ${job.data.txId} start`);

    const req = await this.txRepository.findOne({
      where: {  
        txId: job.data.txId,
      },
    });
    if(!req) {
      this.logger.log(`SEQUENCER.process ${job.data.txId} not found`);
      return false;
    }
    req.txStatus = TS_STATUS.PROCESSING;
    this.txRepository.save(req);
    await this.rollupService.doTransaction(req);
    this.logger.log(`SEQUENCER.process ${job.data.txId} done`);
    await this.txRepository.update(
      {
        txId: req.txId,
      },
      {
        txStatus: TS_STATUS.L2EXECUTED,
      },
    );
    return true;
  }
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
