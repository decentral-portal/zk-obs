import { BullModule } from '@anchan828/nest-bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        options: {
          connection: {
            host: configService.get('BULL_QUEUE_REDIS_HOST'),
            port: configService.get<number>('BULL_QUEUE_REDIS_PORT', 6379),
          }
        },
      })
    }),
  ],
})
export class BullQueueModule {}
