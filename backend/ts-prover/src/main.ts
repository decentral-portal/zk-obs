import { ClusterMessageEventPayload } from '@ts-sdk/domain/events/cluster';
import { TsProverModule } from './ts-prover.module';
import { setupApp } from '@ts-sdk/setup.helper';
import { PinoLoggerService } from '@common/logger/adapters/real/pinoLogger.service';
import { TsWorkerName } from '@ts-sdk/constant';


export async function bootstrap() {
  const app = await setupApp(TsProverModule);
  const logger = app.get(PinoLoggerService);
  logger.setContext(TsWorkerName.PROVER);

  return app;
}