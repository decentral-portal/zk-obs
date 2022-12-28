import { PinoLoggerService } from '@common/logger/adapters/real/pinoLogger.service';
import { Module, OnModuleInit } from '@nestjs/common';
import { LoggerModule } from '@common/logger/logger.module';
import { ConfigModule } from '@nestjs/config';
import { TsWorkerName } from '@ts-sdk/constant';
import { BullQueueModule } from '../../common/bull-queue/src/BullQueue.module';
import { SequencerConsumer } from './infrastructure/sequencer.processor';
import { BullModule } from '@anchan828/nest-bullmq';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlockInfomation } from 'common/ts-typeorm/src/account/blockInformation.entity';
import { TransactionInfo } from 'common/ts-typeorm/src/account/transactionInfo.entity';
import { TsTypeOrmModule } from 'common/ts-typeorm/src/tstypeorm.module';
import { WorkerModule } from '@common/cluster/cluster.module';
import { WorkerService } from '@common/cluster/worker.service';

@Module({
  imports: [
    ConfigModule,
    LoggerModule,
    ScheduleModule.forRoot(),
    BullQueueModule,
    BullModule.registerQueue(TsWorkerName.SEQUENCER),
    TsTypeOrmModule,
    TypeOrmModule.forFeature(
      [
        TransactionInfo,
        BlockInfomation,
      ]),
    WorkerModule,
  ],
  controllers: [],
  providers: [
    SequencerConsumer,
    // SeqProducerService,
  ]
})
export class TsSequencerModule implements OnModuleInit {
  // eslint-disable-next-line no-empty-function
  constructor(
    private readonly logger: PinoLoggerService,
    private readonly workerService: WorkerService,
  ) { }

  onModuleInit(): void {
    this.workerService.ready();
  }
}
