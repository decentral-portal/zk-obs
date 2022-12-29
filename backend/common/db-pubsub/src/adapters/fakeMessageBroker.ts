import { PinoLoggerService } from '@common/logger/adapters/real/pinoLogger.service';
import { Injectable } from '@nestjs/common';
import { EventEmitter } from 'events';
import { MessageBroker } from '../ports/messageBroker';

@Injectable()
export class FakeMessageBrokerService implements MessageBroker {
  channels: string[] = [];
  emitter!: EventEmitter;
  constructor(private readonly logger: PinoLoggerService) {
    this.logger.setContext(FakeMessageBrokerService.name);
    this.connect();
  }
  async connect(): Promise<void> {
    this.emitter = new EventEmitter(); 
  }
  async addChannels(channelNames: string[]): Promise<void> {
    this.channels.push(...channelNames);
  }
  async removeChannel (channelName: string): Promise<void> {
    const index: number = this.channels.findIndex(channel => channel == channelName);
    if (index >= 0) {
      this.emitter.removeAllListeners(this.channels[index]);
      this.channels.splice(index, 1);
    }
  }
  async publish(channelName: string, data: any): Promise<void> {
    this.emitter.emit(channelName, data);
  }
  async subscribe(channelName: string, eventListener: (payload: any) => void): Promise<void>{
    this.emitter.addListener(channelName, eventListener);
  }
  async close():Promise<void> {
    this.logger.log('close');
  }
  async getChannels() {
    return this.channels;
  }
}