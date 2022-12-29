import { TsTokenAddress } from '@ts-sdk/domain/lib/ts-types/ts-types';
import { Connection } from 'typeorm';
import { Factory, Seeder } from 'typeorm-seeding';
import { AuctionBondTokenEntity, BondTokenStatusIndex } from '../auctionOrder/auctionBondToken.entity';
export default class CreateAuctionBondToken implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<void> {
    await connection
      .createQueryBuilder()
      .insert()
      .into(AuctionBondTokenEntity)
      .values([{
        bondId: 1,
        L2Addr: TsTokenAddress.TslBTC20221231,
        underlyingToken: TsTokenAddress.WBTC,
        maturityDate: new Date(19357 * 24 * 60 * 60 * 1000),
        status: BondTokenStatusIndex.isAvailable,
        lastSyncBlocknumberForDepositEvent: 0,
      }, {
        bondId: 1,
        L2Addr: TsTokenAddress.TslETH20221231,
        underlyingToken: TsTokenAddress.WETH,
        maturityDate: new Date(19357 * 24 * 60 * 60 * 1000),
        status: BondTokenStatusIndex.isAvailable,
        lastSyncBlocknumberForDepositEvent: 0,
      }, {
        bondId: 1,
        L2Addr: TsTokenAddress.TslDAI20221231,
        underlyingToken: TsTokenAddress.DAI,
        maturityDate: new Date(19357 * 24 * 60 * 60 * 1000),
        status: BondTokenStatusIndex.isAvailable,
        lastSyncBlocknumberForDepositEvent: 0,
      }, {
        bondId: 1,
        L2Addr: TsTokenAddress.TslUSDC20221231,
        underlyingToken: TsTokenAddress.USDC,
        maturityDate: new Date(19357 * 24 * 60 * 60 * 1000),
        status: BondTokenStatusIndex.isAvailable,
        lastSyncBlocknumberForDepositEvent: 0,
      }, {
        bondId: 1,
        L2Addr: TsTokenAddress.TslUSDT20221231,
        underlyingToken: TsTokenAddress.USDT,
        maturityDate: new Date(19357 * 24 * 60 * 60 * 1000),
        status: BondTokenStatusIndex.isAvailable,
        lastSyncBlocknumberForDepositEvent: 0,
      }, ]).execute();
  }

}