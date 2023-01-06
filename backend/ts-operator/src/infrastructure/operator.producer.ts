/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { ZkOBS } from '../../../ts-contract-types/contracts/ZkOBS';
import { PinoLoggerService } from '@common/logger/adapters/real/pinoLogger.service';
import { Injectable, Scope } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { TransactionInfo } from 'common/ts-typeorm/src/account/transactionInfo.entity';
import { BigNumber, Wallet } from 'ethers';
import {
  InjectSignerProvider,
  EthersSigner,
  InjectContractProvider,
  EthersContract,
  TransactionResponse,
} from 'nestjs-ethers';
import { Connection, Repository } from 'typeorm';
import * as ABI from '../domain/verified-abi.json';

import { RollupInformation } from 'common/ts-typeorm/src/rollup/rollupInformation.entity';
import { WorkerService } from '@common/cluster/worker.service';
import { firstValueFrom } from 'rxjs/internal/firstValueFrom';
import { AccountInformation } from '@common/ts-typeorm/account/accountInformation.entity';
import { MessageBroker } from '@common/db-pubsub/ports/messageBroker';
import { TsWorkerName } from '@ts-sdk/constant';
import { BullQueueInject } from '@anchan828/nest-bullmq';
import { Queue } from 'bullmq';
import { TsTxType } from '@ts-sdk/domain/lib/ts-types/ts-types';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { TsAccountTreeService } from '@common/ts-typeorm/account/tsAccountTree.service';
import { Cron, CronExpression } from '@nestjs/schedule';
@Injectable({
  scope: Scope.DEFAULT,
})
export class OperatorProducer {
  private wallet: Wallet;
  private contract: ZkOBS;
  constructor(
    private readonly config: ConfigService,
    private readonly logger: PinoLoggerService,
    @InjectSignerProvider() private readonly ethersSigner: EthersSigner,
    @InjectContractProvider() private readonly ethersContract: EthersContract,
    @BullQueueInject(TsWorkerName.CORE) private readonly coreQueue: Queue,
    @InjectRepository(TransactionInfo)
    private txRepository: Repository<TransactionInfo>,
    @InjectRepository(RollupInformation)
    private rollupInfoRepository: Repository<RollupInformation>,
    @InjectRepository(AccountInformation)
    private accountRepository: Repository<AccountInformation>,
    private readonly messageBrokerService: MessageBroker,

    private readonly connection: Connection,
    private readonly workerService: WorkerService,
  ) {
    this.wallet = this.ethersSigner.createWallet(
      this.config.get('ETHEREUM_OPERATOR_PRIV', ''),
    );
    this.contract = this.ethersContract.create(
      this.config.get('ETHEREUM_ROLLUP_CONTRACT_ADDR', ''),
      ABI,
      this.wallet,
    ) as unknown as ZkOBS;

    this.logger.log({
      address: this.wallet.address,
      contract: this.contract.address,
    });
    this.listenRegisterEvent();
    this.listenDepositEvent(); //! new
  }

  async listenRegisterEvent() {
    await firstValueFrom(this.workerService.onReadyObserver);
    this.logger.log(
      `OperatorProducer.listenRegisterEvent contract=${this.contract.address}`,
    );
    const filters = this.contract.filters.Register();
    const handler = (log: any) => {
      console.log({
        registerLog: log,
      });
      this.logger.log(
        `OperatorProducer.listenRegisterEvent log:${JSON.stringify(log)}`,
      );
      this.handleRegisterEvent(
        log.args.sender,
        log.args.accountId,
        log.args.tsPubX,
        log.args.tsPubY,
        log.args.l2Addr,
        log,
      );
    };
    const { lastSyncBlocknumberForRegisterEvent } =
      await this.rollupInfoRepository.findOneOrFail({ where: { id: 1 } });
    this.contract
      .queryFilter(filters, lastSyncBlocknumberForRegisterEvent, 'latest')
      .then((logs) => {
        logs.forEach((log) => {
          handler(log);
        });
      });
    this.contract.on(filters, (...args) => {
      handler(args[5]);
    });
  }

  async handleRegisterEvent(
    sender: string,
    accountId: number,
    tsPubX: BigNumber,
    tsPubY: BigNumber,
    l2Addr: string,
    tx: TransactionResponse,
  ) {
    const rollupInfo = await this.rollupInfoRepository.findOneOrFail({
      where: { id: 1 },
    });
    const { blockNumber = 0 } = tx;

    if (blockNumber < rollupInfo.lastSyncBlocknumberForRegisterEvent) {
      this.logger.log(
        `OperatorProducer.listenRegisterEvent SKIP blockNumber=${blockNumber} lastSyncBlocknumberForRegisterEvent=${rollupInfo.lastSyncBlocknumberForRegisterEvent}`,
      );
      return;
    }
    const txRegister = {
      L1Address: sender,
      accountId: accountId.toString(),
      tsPubKeyX: tsPubX.toString(),
      tsPubKeyY: tsPubY.toString(),
    };
    this.logger.log(
      `OperatorProducer.handleRegisterEvent txRegister:${JSON.stringify(
        txRegister,
      )}`,
    );
    await Promise.all([
      this.txRepository.insert({
        reqType: Number(TsTxType.REGISTER),
        accountId: '0',
        tokenId: '0',
        amount: '0',
        arg0: BigInt(accountId.toString()).toString(),
        arg1: BigInt(l2Addr).toString(),
      }),
      this.rollupInfoRepository.update(
        { id: 1 },
        { lastSyncBlocknumberForRegisterEvent: blockNumber },
      ),
    ]);
    await this.accountRepository.upsert(txRegister, ['L1Address']);
    this.coreQueue.add('TransactionInfo', {
      test: true,
    });
    // this.messageBrokerService.publish(CHANNEL.ORDER_CREATED, {});
  }

  //! Deposit Event
  async listenDepositEvent() {
    await firstValueFrom(this.workerService.onReadyObserver);
    this.logger.log(
      `OperatorProducer.listenDepositEvent contract=${this.contract.address}`,
    );
    const filters = this.contract.filters.Deposit();
    const { lastSyncBlocknumberForDepositEvent } =
      await this.rollupInfoRepository.findOneOrFail({ where: { id: 1 } });
    const handler = (log: any) => {
      this.logger.log(
        `OperatorProducer.listenDepositEvent log:${JSON.stringify(log)}`,
      );
      console.log({
        depositLog: log,
      });
      this.handleDepositEvent(
        log.args.sender,
        log.args.accountId,
        log.args.tokenId,
        log.args.amount,
        log,
      );
    };
    this.contract
      .queryFilter(filters, lastSyncBlocknumberForDepositEvent, 'latest')
      .then((logs) => {
        logs.forEach((log) => {
          handler(log);
        });
      });
    this.contract.on(filters, (...args) => {
      console.log({
        args,
      });
      handler(args[4]);
    });
  }

  async handleDepositEvent(
    sender: string,
    accountId: BigNumber,
    tokenId: BigNumber,
    amount: BigNumber,
    tx: TransactionResponse,
  ) {
    const rollupInfo = await this.rollupInfoRepository.findOneOrFail({
      where: { id: 1 },
    });
    const { blockNumber = 0 } = tx;

    if (blockNumber < rollupInfo.lastSyncBlocknumberForDepositEvent) {
      this.logger.log(
        `OperatorProducer.listenDepositEvent SKIP blockNumber=${blockNumber} lastSyncBlocknumberForDepositEvent=${rollupInfo.lastSyncBlocknumberForDepositEvent}`,
      );
      return;
    }
    this.logger.log(
      `OperatorProducer.handleDepositEvent txDeposit:${JSON.stringify({
        tokenId,
        amount,
        accountId,
      })}`,
    );
    const req = {
      reqType: Number(TsTxType.DEPOSIT),
      tokenId: tokenId.toString(),
      amount: amount.toString(),
      arg0: BigInt(accountId.toString()).toString(),
    };
    const account = await this.accountRepository.findOne({
      where: { accountId: accountId.toString() },
    });
    if(!account || !account.L1Address) {
      this.holdTx.push(req);
    } else {
      await this.txRepository.insert(req);
    }
    this.coreQueue.add('TransactionInfo', {
      test: true,
    });
    // this.messageBrokerService.publish(CHANNEL.ORDER_CREATED, {});
    await this.rollupInfoRepository.update(
      { id: 1 },
      { lastSyncBlocknumberForDepositEvent: blockNumber },
    );
  }

  @Cron(CronExpression.EVERY_10_SECONDS)
  private async checkoutHoldTx() {
    console.log({
      holdTx: this.holdTx,
    })
    for (let index = 0; index < this.holdTx.length; index++) {
      const req = this.holdTx[index];
      const account = await this.accountRepository.findOne({
        where: { accountId: req.accountId?.toString() },
      });
      if(account && account.L1Address) {
        await this.txRepository.insert(req);
      }
    }
  }

  private holdTx: QueryDeepPartialEntity<TransactionInfo>[] | QueryDeepPartialEntity<TransactionInfo>[] =[];
}
