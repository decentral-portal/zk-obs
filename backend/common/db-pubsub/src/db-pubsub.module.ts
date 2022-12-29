import { PinoLoggerService } from '@common/logger/adapters/real/pinoLogger.service';
import { LoggerModule } from '@common/logger/logger.module';
import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MessageBrokerService } from './adapters/messageBroker.service';
import { MessageBroker } from './ports/messageBroker';

@Global()
@Module({
  imports: [ConfigModule, LoggerModule],
  providers: [ConfigService, PinoLoggerService, {
    provide: MessageBroker,
    useClass: MessageBrokerService
  }],
  exports: [MessageBroker]
})
export class DatabasePubSubModule {}