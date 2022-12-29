import { TsOperatorModule } from './ts-operator.module';
import { setupApp } from '@ts-sdk/setup.helper';
export async function bootstrap() {
  const app = await setupApp(TsOperatorModule);

  return app;
}