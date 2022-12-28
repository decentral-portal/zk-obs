import { WorkerService } from '@common/cluster/worker.service';
import { PinoLoggerService } from '@common/logger/adapters/real/pinoLogger.service';
import { LoggerModule } from '@common/logger/logger.module';
import { Global, Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { DomainEventPublisher } from './adapters/domainEventPublisher';

@Global()
@Module({
  imports: [
    DomainEventPublisher,
    EventEmitterModule.forRoot(),
    WorkerService,
    LoggerModule
  ],
  providers: [DomainEventPublisher, PinoLoggerService],
  exports: [
    DomainEventPublisher,
  ],
})
export class DomainEventPublisherModule {}
