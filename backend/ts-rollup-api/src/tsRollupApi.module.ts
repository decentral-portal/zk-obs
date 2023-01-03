import { CqrsModule } from '@nestjs/cqrs';
import { Module, Provider, OnModuleInit } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TerminusModule } from '@nestjs/terminus';

import { LoggerModule } from '@common/logger/logger.module';
import { PinoLoggerService } from '@common/logger/adapters/real/pinoLogger.service';
import { TsTypeOrmModule } from '@common/ts-typeorm/tstypeorm.module';

import { TsAccountController } from '@ts-rollup-api/infrastructure/adapters/account.controller';
import { TsTransactionController } from '@ts-rollup-api/infrastructure/adapters/transaction.controller';
// import { L2RealBalanceService } from '@ts-rollup-api/infrastructure/service/L2RealBalance.service';
import { WebSocketModule } from '@common/websocket/websocket.module';
import { BlockInformationController } from './infrastructure/adapters/blockInformation.controller';
import { AvailableService } from './infrastructure/service/available.service';
import { AccountInfoService } from './infrastructure/service/accountInfo.service';
import { BlockInformationServcie } from './infrastructure/service/blockInfo.service';

const controllers = [
  TsAccountController,
  TsTransactionController,
  BlockInformationController
];


const services: Provider[] = [
  AvailableService,
  AccountInfoService,
  BlockInformationServcie
];
@Module({
  controllers,
  imports: [
    TerminusModule,
    ConfigModule,
    CqrsModule,
    ConfigModule,
    LoggerModule,
    JwtModule.register({
      signOptions: { expiresIn: '15m' },
    }),
    TsTypeOrmModule,
    WebSocketModule
  ],
  providers: [
    ...controllers,
    ...services,
    // CheckLendOrderGuard,
    // CheckWithdrawOrderGuard,
    // {
    //   provide: L2BalanceRepository,
    //   useClass: L2RealBalanceService
    // }
  ],
  exports: [...controllers,],
})
export class TsRollupApiModule implements OnModuleInit {
  constructor(
    private readonly logger: PinoLoggerService
  ) { }

  onModuleInit(): void {
  }
}
