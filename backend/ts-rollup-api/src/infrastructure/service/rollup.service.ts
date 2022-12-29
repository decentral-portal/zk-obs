import { PinoLoggerService } from '@common/logger/adapters/real/pinoLogger.service';
import { Injectable, InternalServerErrorException, Scope } from '@nestjs/common';
import { TsRollupAccount } from '@ts-sdk/domain/lib/ts-rollup/ts-account';
import { TsRollupConfigType, RollupCore, RollupCircuitType } from '@ts-sdk/domain/lib/ts-rollup/ts-rollup';
import { TsTxType } from '@ts-sdk/domain/lib/ts-types/ts-types';
import { TsTxRegisterRequest } from '@ts-sdk/domain/lib/ts-types/ts-req-types';

const BACTH_HEIGHT = 0; // 2 ^ 0 = 1
const config: TsRollupConfigType ={
  normal_batch_height: BACTH_HEIGHT,
  register_batch_size: 10,
  l2_acc_addr_size: 12,
  l2_token_addr_size: 10,
  token_tree_height: 10,
  isPendingRollup: true,
  order_tree_height: 10,

  auction_market_count: 100,
  auction_lender_count: 100,
  auction_borrower_count: 100,
};

@Injectable({
  scope: Scope.DEFAULT,
})
export class TsRollupService  {
  public rollup = new RollupCore(config);
  public L2ToL1 = new Map();
  public L1ToL2 = new Map();
  constructor(private logger: PinoLoggerService) {
    this.logger.setContext('TsRollupService');
  }

  public getL1AddressFromL2Address(L2Address: string) {
    const L1Address = this.L2ToL1.get(L2Address);
    if(!L1Address) {
      throw new InternalServerErrorException('L2Address not found');
    }
    return L1Address;
  }

  public getAccountFromL1Address(L1Address: string) {
    const L2Address = this.L1ToL2.get(L1Address.toLowerCase());
    if(!L2Address) {
      throw new InternalServerErrorException('L1Address not found');
    }
    return this.rollup.getAccount(BigInt(L2Address));
  }

  public async register(L1Address: string, account: TsRollupAccount) {
    if(this.L1ToL2.has(L1Address.toLowerCase())) {
      throw new InternalServerErrorException('L1Address already exists');
    }
    return await this.rollup.startRollup(async (rp, blockNumber) => {
      const L2AddrFrom = rp.currentAccountAddr.toString();
      await rp.doTransaction({
        reqType: TsTxType.REGISTER,
        L2AddrFrom,
        L2TokenAddr: account.tokenLeafs[0].tokenAddr,
        tsPubKey: [account.tsPubKey[0].toString(), account.tsPubKey[1].toString()],
        amount: account.tokenLeafs[0].amount.toString(),
      } as TsTxRegisterRequest);
      account.setAccountAddress(BigInt(L2AddrFrom));
      this.L1ToL2.set(L1Address.toLowerCase(), L2AddrFrom);
      this.L2ToL1.set(L2AddrFrom, L1Address.toLowerCase());
    }, RollupCircuitType.Register);
  }
}
