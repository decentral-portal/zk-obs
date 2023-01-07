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
  Log,
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
    setInterval(() => {
      this.checkoutHoldTx();
    }, 5000);
  }

  async listenRegisterEvent() {
    await firstValueFrom(this.workerService.onReadyObserver);
    this.logger.log(
      `OperatorProducer.listenRegisterEvent contract=${this.contract.address}`,
    );
    const filters = this.contract.filters.Register();
    const handler = async (log: any) => {
      this.logger.log(
        `OperatorProducer.listenRegisterEvent log:${JSON.stringify(log)}`,
      );
      return await this.handleRegisterEvent(
        log.args.sender,
        log.args.accountId,
        log.args.tsPubX,
        log.args.tsPubY,
        log.args.l2Addr,
        log,
      );
    };
    const { lastSyncBlocknumberForRegisterEvent } = await this.rollupInfoRepository.findOneOrFail({ where: { id: 1 } });
    
    const logs = await this.contract.queryFilter(filters, lastSyncBlocknumberForRegisterEvent, 'latest');
    this.contract.on(filters, (...args) => {
      handler(args[5]);
    });
    for (let index = 0; index < logs.length; index++) {
      const log = logs[index];
      await handler(log);
    }
    const blockNumbers = logs.map((log) => Number(log.blockNumber)).sort((a, b) => b - a);
    this.rollupInfoRepository.update(
      { id: 1 },
      { lastSyncBlocknumberForRegisterEvent: blockNumbers[blockNumbers.length - 1] },
    );
    
    
  }

  async handleRegisterEvent(
    sender: string,
    accountId: number,
    tsPubX: BigNumber,
    tsPubY: BigNumber,
    l2Addr: string,
    tx: Log,
  ) {
    const oldTx = await this.txRepository.findOne({
      where: {
        L1TxHash: tx.transactionHash,
      },
    });
    if (oldTx) {
      this.logger.log(
        `OperatorProducer.handleRegisterEvent tx already exist:${JSON.stringify(
          oldTx,
        )}`,
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
        L1TxHash: tx.transactionHash,
      }),
      this.accountRepository.upsert(txRegister, ['L1Address']),
      this.coreQueue.add('TransactionInfo', {
        test: true,
      })
    ]);
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
    const handler = async (log: any) => {
      this.logger.log(
        `OperatorProducer.listenDepositEvent log:${JSON.stringify(log)}`,
      );
      this.handleDepositEvent(
        log.args.sender,
        log.args.accountId,
        log.args.tokenId,
        log.args.amount,
        log,
      );
    };
    const logs = await this.contract.queryFilter(filters, lastSyncBlocknumberForDepositEvent, 'latest');
    this.contract.on(filters, (...args) => {
      handler(args[4]);
    });
    for (let index = 0; index < logs.length; index++) {
      const log = logs[index];
      await handler(log);
    }
    const blockNumbers = logs.map((log) => Number(log.blockNumber)).sort((a, b) => b - a);
    this.rollupInfoRepository.update(
      { id: 1 },
      { lastSyncBlocknumberForDepositEvent: blockNumbers[blockNumbers.length - 1] },
    );
  }

  async handleDepositEvent(
    sender: string,
    accountId: BigNumber,
    tokenId: BigNumber,
    amount: BigNumber,
    tx: Log,
  ) {
    const oldTx = await this.txRepository.findOne({
      where: {
        L1TxHash: tx.transactionHash,
      },
    });
    if (oldTx) {
      this.logger.log(
        `OperatorProducer.handleDepositEvent tx already exist:${JSON.stringify(
          oldTx,
        )}`,
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
      L1TxHash: tx.transactionHash,
    };
    const account = await this.accountRepository.findOne({
      where: { accountId: accountId.toString() },
    });
    if(!account || !account.L1Address) {
      this.holdTx.push(req);
    } else {
      await this.txRepository.insert(req);
      this.coreQueue.add('TransactionInfo', {
        test: true,
      });
    }
  }

  // @Cron(CronExpression.EVERY_10_SECONDS)
  private async checkoutHoldTx() {
    if(this.holdTxProcessing) {
      this.logger.log('checkoutHoldTx holdTxProcessing');
      return;
    }
    this.holdTxProcessing = true;
    try {
      const newArr = [];
      for (let index = 0; index < this.holdTx.length; index++) {
        const req = this.holdTx[index];
        const account = await this.accountRepository.findOne({
          where: { accountId: req.accountId?.toString() },
        });
        if(account && account.L1Address) {
          await this.txRepository.insert(req);
        } else {
          newArr.push(req);
        }
      }
      this.logger.log(`checkoutHoldTx has ${newArr.length} remain txs`);
      this.holdTx = newArr;
    } catch (error) {
      console.error(error); 
    } finally {
      this.holdTxProcessing = false;
    }
  }

  private holdTx: QueryDeepPartialEntity<TransactionInfo>[] | QueryDeepPartialEntity<TransactionInfo>[] =[];
  private holdTxProcessing = false;
}
