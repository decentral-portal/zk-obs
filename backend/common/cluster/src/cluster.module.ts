import { LoggerModule } from '@common/logger/logger.module';
import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MainProcessService } from './main-process.service';
import { WorkerService } from './worker.service';
@Global()
@Module({
  imports: [
    ConfigModule,
    LoggerModule,
  ],
  providers: [
    MainProcessService,
  ],
  exports: [MainProcessService]
})
export class MainProcessModule {}

@Global()
@Module({
  imports: [
    ConfigModule,
    LoggerModule,
  ],
  providers: [
    WorkerService,
  ],
  exports: [WorkerService]
})
export class WorkerModule {}
