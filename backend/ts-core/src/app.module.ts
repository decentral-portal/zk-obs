// Nest imports
import { PinoLoggerService } from '@common/logger/adapters/real/pinoLogger.service';
import { LoggerModule } from '@common/logger/logger.module';
import { Module, OnModuleInit } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ConfigModule } from '@nestjs/config';
import { TsWorkerName } from '../../ts-sdk/src/constant';
import { ScheduleModule } from '@nestjs/schedule';
import { ProducerService } from './producer.service';
import { BullQueueModule } from 'common/bull-queue/src/BullQueue.module';
import { TsTypeOrmModule } from 'common/ts-typeorm/src/tstypeorm.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlockInformation } from 'common/ts-typeorm/src/account/blockInformation.entity';
import { BullModule } from '@anchan828/nest-bullmq';
import { DatabasePubSubModule } from '@common/db-pubsub/db-pubsub.module';
import { TransactionInfo } from 'common/ts-typeorm/src/account/transactionInfo.entity';
import { MainProcessModule } from '@common/cluster/cluster.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    CqrsModule,
    LoggerModule,
    // NotificationsModule,
    ScheduleModule.forRoot(),
    BullQueueModule,
    TsTypeOrmModule,
    TypeOrmModule.forFeature(
      [
        TransactionInfo,
        BlockInformation,
      ]),
    BullModule.registerQueue(
      {
        queueName: TsWorkerName.CORE,
      },
      {
        queueName: TsWorkerName.SEQUENCER,
      }, {
        queueName: TsWorkerName.PROVER,
      }, {
        queueName: TsWorkerName.OPERATOR,
      }
    ),
    DatabasePubSubModule,
    MainProcessModule,
  ],
  controllers: [],
  providers: [
    ProducerService,
  ]
})
export class AppModule implements OnModuleInit {
  // eslint-disable-next-line no-empty-function
  constructor(private readonly logger: PinoLoggerService) { }

  onModuleInit(): void {
    this.logger.setContext(TsWorkerName.CORE);
  }
}
