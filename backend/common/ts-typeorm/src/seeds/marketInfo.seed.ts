import { Connection } from 'typeorm';
import { Factory, Seeder } from 'typeorm-seeding';
import { MarketPairInfoEntity } from '../auctionOrder/marketPairInfo.entity';

export default class CreateMarketInfos implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<void> {
    
    await connection
      .createQueryBuilder()
      .insert()
      .into(MarketPairInfoEntity)
      .values([{
        mainTokenId: 0n.toString(),
        baseTokenId: 1n.toString(),
        marketPair: 'ETH/USDC',
      }]).execute(); 
  }

}