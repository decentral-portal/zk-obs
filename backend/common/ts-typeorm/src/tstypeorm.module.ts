import { PinoLoggerService } from '@common/logger/adapters/real/pinoLogger.service';
import { LoggerModule } from '@common/logger/logger.module';
import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountModule } from '@common/ts-typeorm/account/account.module';
import { AuctionOrderMoudle } from '@common/ts-typeorm/auctionOrder/auctionOrder.module';
import { RollupModule } from '@common/ts-typeorm/rollup/rollup.module';
@Global()
@Module({
  imports: [
    ConfigModule,
    LoggerModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const isProduction = configService.get('NODE_ENV') === 'prod';
        return {
          ssl: isProduction,
          extra: {
            ssl: isProduction? { rejectUnauthorized: false } : null,
          },
          type: 'postgres',
          host: configService.get<string>('DB_HOST', ''),
          port: configService.get<number>('DB_PORT', 5432),
          username: configService.get<string>('DB_USER', ''),
          password: configService.get<string>('DB_PASSWD', ''),
          database: configService.get<string>('DB_NAME', ''),
          autoLoadEntities: true,
          synchronize: configService.get<string>('NODE_ENV', 'dev') == 'dev',
          // subscribers: [
          //   TransactionSubscriber,
          // ]
        };
      },
    }),
    // AccountModule,
    AccountModule, AuctionOrderMoudle, RollupModule
  ],
  providers: [
    TypeOrmModule,
    PinoLoggerService
  ],
  exports: [TypeOrmModule]
})
export class TsTypeOrmModule {}
