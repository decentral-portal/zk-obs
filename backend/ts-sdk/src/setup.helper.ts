import { PinoLoggerService } from '@common/logger/adapters/real/pinoLogger.service';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { getWorkerName, getProcessName } from './helper';


export async function setupApp(module: any) {
  const app = await NestFactory.createApplicationContext(module);
  const configService = app.get(ConfigService);
  const workerName = getWorkerName();
  const logger = app.get(PinoLoggerService);

  logger.setContext(getProcessName());
  app.useLogger(logger);

  logger.log(`${getProcessName()}: server started!`);
  return app;
}

