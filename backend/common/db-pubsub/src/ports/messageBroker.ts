import { Injectable } from '@nestjs/common';

@Injectable()
export abstract class MessageBroker {
  connect!: () => Promise<void>;
  addChannels!: (channelNames:string[]) => Promise<void>;
  removeChannel!: (channelName:string) => Promise<void>;
  publish!: (channelName: string, data: any) => Promise<void>;
  subscribe!: (channelName: string,  eventListener: (payload: any)=>void ) => Promise<void>;
  close!: () => Promise<void>;
} 