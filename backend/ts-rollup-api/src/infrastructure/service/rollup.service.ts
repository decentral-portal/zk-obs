import { PinoLoggerService } from '@common/logger/adapters/real/pinoLogger.service';
import { TransactionInfo } from '@common/ts-typeorm/account/transactionInfo.entity';
import { Injectable, InternalServerErrorException, Scope } from '@nestjs/common';
import { TsRollupConfigType, RollupCore } from '@ts-sdk/domain/lib/ts-rollup/ts-rollup';
import { TsRollupCircuitInputItemType } from '@ts-sdk/domain/lib/ts-types/ts-circuit-types';

const config: TsRollupConfigType = {
  order_tree_height: 8,
  l2_acc_addr_size: 8,
  token_tree_height: 4,
  nullifier_tree_height: 8,
  numOfReqs: 20,
  numOfChunks: 50,

  register_batch_size: 1,
  l2_token_addr_size: 32,
  auction_market_count: 8,
  auction_lender_count: 8,
  auction_borrower_count: 8,
};

@Injectable({
  scope: Scope.DEFAULT,
})
export class TsRollupService {
  public rollup = new RollupCore(config);
  public L2ToL1 = new Map();
  public L1ToL2 = new Map();
  constructor(private logger: PinoLoggerService) {
    this.logger.setContext('TsRollupService');
  }

  async doTransaction(req: TransactionInfo) {
    return await this.rollup.doTransaction(req);
  }

  public getL1AddressFromaccountId(accountId: string) {
    const L1Address = this.L2ToL1.get(accountId);
    if (!L1Address) {
      throw new InternalServerErrorException('accountId not found');
    }
    return L1Address;
  }

  public getAccountFromL1Address(L1Address: string) {
    const accountId = this.L1ToL2.get(L1Address.toLowerCase());
    if (!accountId) {
      throw new InternalServerErrorException('L1Address not found');
    }
    return this.rollup.getAccount(BigInt(accountId));
  }
}
