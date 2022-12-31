import { PinoLoggerService } from '@common/logger/adapters/real/pinoLogger.service';
import { Injectable, Scope } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { VerifierContract } from '@ts-operator/domain/verifier-contract';
import { TransactionInfo } from 'common/ts-typeorm/src/account/transactionInfo.entity';
import { Wallet } from 'ethers';
import { InjectSignerProvider, EthersSigner, InjectContractProvider, EthersContract, TransactionResponse } from 'nestjs-ethers';
import { Connection, Repository } from 'typeorm';
import * as ABI from '../domain/verified-abi.json';

import { RollupInformation } from 'common/ts-typeorm/src/rollup/rollupInformation.entity';
import BigNumber from 'bignumber.js';
import { WorkerService } from '@common/cluster/worker.service';
import { firstValueFrom } from 'rxjs/internal/firstValueFrom';
import { AccountInformation } from '@common/ts-typeorm/account/accountInformation.entity';
@Injectable({
  scope: Scope.DEFAULT,
})
export class OperatorProducer {
  private wallet: Wallet;
  private contract: VerifierContract;
  constructor(
    private readonly config: ConfigService,
    private readonly logger: PinoLoggerService,
    @InjectSignerProvider() private readonly ethersSigner: EthersSigner,
    @InjectContractProvider() private readonly ethersContract: EthersContract,
    @InjectRepository(TransactionInfo) private txRepository: Repository<TransactionInfo>,
    @InjectRepository(RollupInformation) private rollupInfoRepository: Repository<RollupInformation>,
    @InjectRepository(AccountInformation) private accountRepository: Repository<AccountInformation>,
    private readonly connection: Connection,
    private readonly workerService: WorkerService,
  ) {
    this.wallet = this.ethersSigner.createWallet(this.config.get('ETHEREUM_OPERATOR_PRIV', ''));
    this.contract = this.ethersContract.create(this.config.get('ETHEREUM_ROLLUP_CONTRACT_ADDR', ''), ABI, this.wallet) as unknown as VerifierContract;

    this.logger.log({
      address: this.wallet.address,
      contract: this.contract.address,
    });
    this.listenRegisterEvent();
  }

  async listenRegisterEvent() {
    await firstValueFrom(this.workerService.onReadyObserver);
    this.logger.log(`OperatorProducer.listenRegisterEvent contract=${this.contract.address}`);
    const filters = this.contract.filters.Register();
    const handler = (log: any) => {
      this.handleRegisterEvent(log.args.L1Addr, log.args.L2Addr, log.args.TSPubKey, log.args.tsAddr, log.transactionHash);
    };
    this.contract.on(filters, handler.bind(this));
  }

  async handleRegisterEvent(l1Addr: string, l2Addr: BigNumber, tsPubKey: [BigNumber, BigNumber], tsAddr: BigNumber, tx: TransactionResponse) {
    const rollupInfo = await this.rollupInfoRepository.findOneOrFail({ where: { id: 1 } });
    const { blockNumber = 0 } = tx;

    if (blockNumber <= rollupInfo.lastSyncBlocknumberForRegisterEvent) {
      this.logger.log(
        `OperatorProducer.listenRegisterEvent skip blockNumber=${blockNumber} lastSyncBlocknumberForRegisterEvent=${rollupInfo.lastSyncBlocknumberForRegisterEvent}`,
      );
      return;
    }
    // TODO: 1. upsert AccountInformation
    this.accountRepository.upsert(
      {
        L1Address: l1Addr,
        accountId: l2Addr.toString(),
        tsPubKeyX: tsPubKey[0].toString(),
        tsPubKeyY: tsPubKey[1].toString(),
      },
      ['L1Address'],
    );
    // TODO: 2. insert TransactionInfo
    this.txRepository.insert({
      accountId: 0n,
      tokenId: 0n,
      amount: 0n,
      arg0: BigInt(l2Addr.toString()),
      arg1: BigInt(tsAddr.toString()),
    });
    this.logger.log(`OperatorProducer.listenRegisterEvent ${l1Addr} ${l2Addr} ${tsPubKey}`);
  }
}
