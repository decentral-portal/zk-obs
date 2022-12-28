import { Connection } from 'typeorm';
import { Factory, Seeder } from 'typeorm-seeding';
import { RollupInformation } from '../rollup/rollupInformation.entity';
export default class CreateRollupInfos implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<void> {
    await connection
      .createQueryBuilder()
      .insert()
      .into(RollupInformation)
      .values([{
        id: 1,
        lastSyncBlocknumberForRegisterEvent: 0,
        lastSyncBlocknumberForDepositEvent: 0,
      }]).execute();
  }

}