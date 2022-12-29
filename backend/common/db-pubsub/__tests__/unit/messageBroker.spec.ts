import { FakeLoggerService } from '@common/logger/adapters/fake/FakeLogger.service';
import { PinoLoggerService } from '@common/logger/adapters/real/pinoLogger.service';
import { Test } from '@nestjs/testing';
import { FakeMessageBrokerService } from '@common/db-pubsub/adapters/fakeMessageBroker';
import { MessageBroker } from '@common/db-pubsub/ports/messageBroker';

describe('[Unit] messageBroker', () => {
  let messageBroker: MessageBroker;
  beforeEach(() => {
    jest.setTimeout(30000);
  });
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        {
          provide: MessageBroker,
          useClass: FakeMessageBrokerService
        },
        {
          provide: PinoLoggerService,
          useClass: FakeLoggerService,
        }
      ]
    }).compile();
    messageBroker = moduleRef.get<MessageBroker>(MessageBroker);
  });
  it('check messageBroker is defined', async () => {
    expect(messageBroker).toBeDefined();
  });
  it('check connect could be called', async () => {
    jest.spyOn(messageBroker, 'connect').mockResolvedValue();
    await messageBroker.connect();
    expect(messageBroker.connect).toBeCalled();
  });
  it('When add Channel, and subscribe Channel, pulish Message to Channel, eventListener should be called', async () => {
    await messageBroker.addChannels(['ch1']);
    const eventListenr = jest.fn().mockResolvedValue({});
    await messageBroker.subscribe('ch1', eventListenr);
    await messageBroker.publish('ch1', { sender: 'publisher' });
    expect(eventListenr).toBeCalledTimes(1);
  });
  it('When add Channel, and subscribe Channel, pulish Message to different Channel , eventListener should not be called', async () => {
    await messageBroker.addChannels(['ch2']);
    const eventListenr = jest.fn().mockResolvedValue({});
    await messageBroker.subscribe('ch2', eventListenr);
    await messageBroker.publish('ch1', { sender: 'publisher' });
    expect(eventListenr).toBeCalledTimes(0);
  });
});