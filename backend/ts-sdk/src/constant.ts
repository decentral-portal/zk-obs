import type { Worker } from 'cluster';
import { INestApplication, INestApplicationContext } from '@nestjs/common';

export enum TsWorkerName {
  UNKNOWN = 'unknown',
  CORE = 'TsCore',
  OPERATOR = 'TsOperator',
  PROVER = 'TsProver',
  SEQUENCER = 'TsSequencer',
  GATEWAY = 'TsGateway',
}

export type WorkerItem = {
  name: TsWorkerName;
  bootstrap: () => Promise<INestApplicationContext | INestApplication>;
  worker?: Worker;
  isReady?: boolean;
}
