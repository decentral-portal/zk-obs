import * as _cluster from 'cluster';
import type { Cluster } from 'cluster';
const cluster = _cluster as unknown as Cluster;
// import { bootstrap as GatewayBootstrap } from '@ts-rollup-api/main';
import { bootstrap as OperatorBootstrap } from '@ts-operator/main';
import { bootstrap as SequencerBootstrap } from '@ts-sequencer/main';
import { bootstrap as ProverBootstrap } from '@ts-prover/main';
import { TsWorkerName, WorkerItem } from '@ts-sdk/constant';
import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';
import { PinoLoggerService } from '@common/logger/adapters/real/pinoLogger.service';
import { getProcessName, getWorkerName } from '@ts-sdk/helper';
import { MainProcessService } from '@common/cluster/main-process.service';

clusterize([
  // {
  //   name: TsWorkerName.GATEWAY,
  //   bootstrap: GatewayBootstrap,
  // },
  { 
    name: TsWorkerName.OPERATOR,
    bootstrap: OperatorBootstrap,
  },
  { 
    name: TsWorkerName.SEQUENCER,
    bootstrap: SequencerBootstrap,
  },
  { 
    name: TsWorkerName.PROVER,
    bootstrap: ProverBootstrap,
  },
]);
async function clusterize(workers: WorkerItem[]) {
  if(cluster.isPrimary){
    await setupMasterApp(AppModule, workers);
  } else {
    const workerName = getWorkerName();
    const worker = workers.find((item) => item.name === workerName);
    if(worker) {
      await worker.bootstrap();
    } else {
      throw new Error(`Worker ${workerName} not found`);
    }
  }
}

async function setupMasterApp(module: unknown, workers: WorkerItem[]) {
  const app = await NestFactory.createApplicationContext(module);
  const logger = app.get(PinoLoggerService);
  logger.setContext(getWorkerName());
  const clusterService = app.get(MainProcessService);
  clusterService.clusterize(workers);
  logger.setContext(getProcessName());

  logger.log(`${TsWorkerName.CORE}: server started!`);
  return app;
}
