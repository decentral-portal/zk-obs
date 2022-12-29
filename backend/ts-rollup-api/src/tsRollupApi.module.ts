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
import { TsRollupService } from '@ts-rollup-api/infrastructure/service/rollup.service';
import { CheckLendOrderGuard } from '@ts-rollup-api/infrastructure/guards/check-lend-order.guard';
import { L2BalanceRepository } from '@ts-rollup-api/infrastructure/ports/L2Balance.repository';
// import { L2RealBalanceService } from '@ts-rollup-api/infrastructure/service/L2RealBalance.service';
import { CheckWithdrawOrderGuard } from '@ts-rollup-api/infrastructure/guards/check-withdraw-order.guard';
import { WebSocketModule } from '@common/websocket/websocket.module';

const controllers = [
  TsAccountController,
  TsTransactionController
];


const services: Provider[] = [
  TsRollupService,
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
  exports: [...controllers, TsRollupService],
})
export class TsRollupApiModule implements OnModuleInit {
  constructor(
    private readonly logger: PinoLoggerService
  ) { }

  onModuleInit(): void {
  }
}
