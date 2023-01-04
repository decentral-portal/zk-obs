import { OperatorConsumer } from './infrastructure/operator.processor';
import { PinoLoggerService } from '@common/logger/adapters/real/pinoLogger.service';
import { Module, OnModuleInit } from '@nestjs/common';
import { LoggerModule } from '@common/logger/logger.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TsWorkerName } from '@ts-sdk/constant';
import { BullQueueModule } from 'common/bull-queue/src/BullQueue.module';
import { EthersModule, MAINNET_NETWORK, GOERLI_NETWORK, Network } from 'nestjs-ethers';
import { BullModule } from '@anchan828/nest-bullmq';
import { TsTypeOrmModule } from 'common/ts-typeorm/src/tstypeorm.module';
import { OperatorProducer } from './infrastructure/operator.producer';
import { RollupInformation } from 'common/ts-typeorm/src/rollup/rollupInformation.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionInfo } from 'common/ts-typeorm/src/account/transactionInfo.entity';
import { WorkerModule } from '@common/cluster/cluster.module';
import { WorkerService } from '@common/cluster/worker.service';
import { DatabasePubSubModule } from '@common/db-pubsub/db-pubsub.module';
import { AccountInformation } from '@common/ts-typeorm/account/accountInformation.entity';
import { BlockInformation } from '@common/ts-typeorm/account/blockInformation.entity';

const localNetwork = {
  name: 'LOCAL',
  chainId: 31337,
  _defaultProvider: (providers: any) => {
    return new providers.JsonRpcProvider('http://localhost:8545');
  },
};
@Module({
  imports: [
    ConfigModule,
    LoggerModule,
    BullQueueModule,
    BullModule.registerQueue({
      queueName: TsWorkerName.CORE,
    },
    {
      queueName: TsWorkerName.OPERATOR,
    }),
    TsTypeOrmModule,
    TypeOrmModule.forFeature([BlockInformation, RollupInformation, TransactionInfo, AccountInformation]),
    EthersModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        network: configService.get('ETHEREUM_NETWORK', 'TESTNET') === 'MAINNET' ? MAINNET_NETWORK : GOERLI_NETWORK,
        etherscan: configService.get('ETHERSCAN_API_KEY'),
        // custom: {
        //   url: 'http://localhost:8545',
        // },
        // infura: configService.get('INFURA_API_KEY'),
        quorum: 1,
        useDefaultProvider: true,
      }),
    }),
    WorkerModule,
    DatabasePubSubModule,
  ],
  controllers: [],
  providers: [OperatorConsumer, OperatorProducer,],
})
export class TsOperatorModule implements OnModuleInit {
  // eslint-disable-next-line no-empty-function
  constructor(private readonly logger: PinoLoggerService, private readonly workerService: WorkerService) {}

  onModuleInit(): void {
    this.workerService.ready();
  }
}
