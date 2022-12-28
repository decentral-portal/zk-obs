import { TsSequencerModule } from './ts-sequencer.module';
import { setupApp } from '@ts-sdk/setup.helper';
export async function bootstrap() {
  const app = await setupApp(TsSequencerModule);

  return app;
}