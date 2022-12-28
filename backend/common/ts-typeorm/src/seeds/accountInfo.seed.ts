import { Connection } from 'typeorm';
import { Factory, Seeder } from 'typeorm-seeding';
import { AccountInformation } from '../account/accountInformation.entity';
import * as bcrypt from 'bcrypt';
import { Role } from '../account/role.enum';
export default class CreateAccountInfos implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<void> {
    enum TsTokenAddress {
      Unknown = '0',
      WETH = '1',
      WBTC = '2',
      USDT = '3',
      USDC = '4',
      DAI = '5',
    }
    const now = new Date();
    const hashedPassword = bcrypt.hashSync('password' ,bcrypt.genSaltSync(10));
    await connection
      .createQueryBuilder()
      .insert()
      .into(AccountInformation)
      .values([{
        L1Address: 'burnAccount',
        L2Address: 0n.toString(),
        email: 'burnAccount@tkspring.com', 
        updatedBy: 'Server'
      }, {
        L1Address: 'mintAccount',
        L2Address: 1n.toString(),
        email: 'mintAccount@tkpsring.com',
        updatedBy: 'Server'
      }, {
        L1Address: 'withdrawAccount',
        L2Address: 2n.toString(),
        email: 'withdrawAccount@tkspring.com',
        updatedBy: 'Server'
      }, {
        L1Address: 'redeemAccount',
        L2Address: 3n.toString(),
        email: 'redeemmAccount@tkspring.com',
        updatedBy: 'Server'
      }, {
        L1Address: 'auditionAccount',
        L2Address: 10n.toString(),
        email: 'auctionAccount@tkspring.com',
        updatedBy: 'Server'
      }, {
        L1Address: 'secondaryAccount',
        L2Address: 11n.toString(),
        email: 'secondaryAccount@tkpsring.com',
        updatedBy: 'Server'
      }, {
        L1Address: 'repoAccount',
        L2Address: 12n.toString(),
        email: 'repoAccount@tkspring.com',
        updatedBy: 'Server'
      },
      {
        L1Address: '690B9A9E9aa1C9dB991C7721a92d351Db4FaC990',
        L2Address: 100n.toString(),
        email: 'yuanyu90221@gmail.com',
        lastedLoginIp: '127.0.0.1',
        lastLoginTime: now,
        role: Role.MEMBER,
        password: hashedPassword,
        updatedBy: 'Server'
      }, {
        L1Address: '319AbFF6695E87d5E402F803045AaD0F07b5dA7d',
        L2Address: 101n.toString(),
        email: 'yuanyu.liang@tkspring.com',
        lastedLoginIp: '127.0.0.1',
        lastLoginTime: now,
        role: Role.MEMBER,
        password: hashedPassword,
        updatedBy: 'Server'
      }]).execute(); 
  }

}