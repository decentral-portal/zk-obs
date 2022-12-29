import { PinoLoggerService } from '@common/logger/adapters/real/pinoLogger.service';
import { Module, OnModuleInit } from '@nestjs/common';
import { LoggerModule } from '@common/logger/logger.module';
import { ConfigModule } from '@nestjs/config';
import { TsWorkerName } from '@ts-sdk/constant';
import { BullQueueModule } from 'common/bull-queue/src/BullQueue.module';
import { ProverConsumer } from './infrastructure/prover.processor';
import { BullModule } from '@anchan828/nest-bullmq';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlockInfomation } from 'common/ts-typeorm/src/account/blockInformation.entity';
import { TransactionInfo } from 'common/ts-typeorm/src/account/transactionInfo.entity';
import { TsTypeOrmModule } from 'common/ts-typeorm/src/tstypeorm.module';
import { WorkerService } from '@common/cluster/worker.service';
import { WorkerModule } from '../../common/cluster/src/cluster.module';

@Module({
  imports: [
    ConfigModule,
    LoggerModule,
    BullQueueModule,
    BullModule.registerQueue(TsWorkerName.PROVER),
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
    ProverConsumer,
  ],
})
export class TsProverModule implements OnModuleInit {
  constructor(
    private readonly logger: PinoLoggerService,
    private readonly workerService: WorkerService,
  ) { }

  onModuleInit(): void {
    this.workerService.ready();
  }
}
