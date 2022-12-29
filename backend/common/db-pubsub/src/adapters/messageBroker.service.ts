import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MessageBroker } from '../ports/messageBroker';
import { PgPubSub } from '@imqueue/pg-pubsub';
import { PinoLoggerService } from '@common/logger/adapters/real/pinoLogger.service';
import { threadId } from 'worker_threads';
@Injectable()
export class MessageBrokerService implements MessageBroker {
  private DATABASE_URL: string;
  private pubSubInstance: PgPubSub;
  constructor(private readonly configService: ConfigService,
    private readonly logger: PinoLoggerService
  ) {
    this.logger.setContext(MessageBrokerService.name);
    this.DATABASE_URL = this.configService.get<string>('DATABASE_URL', '');
    this.pubSubInstance = new PgPubSub({
      connectionString: this.DATABASE_URL,
      singleListener: false
    });
    this.connect();
  }
  async connect(): Promise<void> {
    this.pubSubInstance.connect()
      .catch(err => {
        this.logger.error(err);
      })
    ;
  }
  async addChannels(channelNames: string[]): Promise<void> {
    this.logger.log(channelNames);
    await Promise.all(channelNames.map(channelName => ()=> this.pubSubInstance.listen(channelName)));
  }
  async subscribe(channelName: string, eventListener: ((payload: any) => void)): Promise<void> {
    this.logger.log(`addChannelListener: ${channelName}`);
    console.log('subscribe', channelName);
    await this.pubSubInstance.channels.on(channelName, eventListener);
  }
  async removeChannel(channelName: string): Promise<void> {
    this.logger.log(`removeChannel: ${channelName}`);
    await this.pubSubInstance.unlisten(channelName);
  }
  async publish(channelName: string, data: any): Promise<void> {
    console.log({name:'publish', channelName, data});
    this.logger.log({name:'publish', channelName, data});
    await this.pubSubInstance.channels.emit(channelName, data);
  }
  async close():Promise<void> {
    this.logger.log('close');
    await this.pubSubInstance.close();
  }
  
}