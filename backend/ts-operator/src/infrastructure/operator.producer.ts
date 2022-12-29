import { PinoLoggerService } from '@common/logger/adapters/real/pinoLogger.service';
import { Injectable, Scope } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { VerifierContract } from '@ts-operator/domain/verifier-contract';
import { TsTxRegisterRequest } from '@ts-sdk/domain/lib/ts-types/ts-req-types';
import { TsTokenAddress, TsTxType } from '@ts-sdk/domain/lib/ts-types/ts-types';
import { TransactionInfo, } from 'common/ts-typeorm/src/account/transactionInfo.entity';
import { Wallet } from 'ethers';
import { InjectSignerProvider, EthersSigner, InjectContractProvider, EthersContract, TransactionResponse } from 'nestjs-ethers';
import { Repository } from 'typeorm';
import * as ABI from '../domain/verified-abi.json';

import axios from 'axios';
import { RollupInformation } from 'common/ts-typeorm/src/rollup/rollupInformation.entity';
import BigNumber from 'bignumber.js';
import { WorkerService } from '@common/cluster/worker.service';
import { firstValueFrom } from 'rxjs/internal/firstValueFrom';
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
    private readonly workerService: WorkerService,
  ) {
    this.wallet = this.ethersSigner.createWallet(this.config.get('ETHEREUM_OPERATOR_PRIV', ''));
    this.contract = this.ethersContract.create(this.config.get('ETHEREUM_ROLLUP_CONTRACT_ADDR', ''), ABI, this.wallet) as unknown as VerifierContract;

    this.logger.log({
      address: this.wallet.address,
      contract: this.contract.address
    });
    this.listenRegisterEvent();
  }
  
  async listenRegisterEvent() {
    await firstValueFrom(this.workerService.onReadyObserver);
    this.logger.log(`OperatorProducer.listenRegisterEvent contract=${this.contract.address}`);
    const filters = this.contract.filters.Register();
    this.contract.on(filters,  this.handleRegisterEvent.bind(this));
  }

  async handleRegisterEvent(l1Addr: string, l2Addr: number, tsPubKey: [BigNumber, BigNumber], tx: TransactionResponse)  {
    const rollupInfo = await this.rollupInfoRepository.findOneOrFail({ where: { id: 1} });
    const { blockNumber = 0 } = tx;

    if(blockNumber <= rollupInfo.lastSyncBlocknumberForRegisterEvent) {
      this.logger.log(`OperatorProducer.listenRegisterEvent skip blockNumber=${blockNumber} lastSyncBlocknumberForRegisterEvent=${rollupInfo.lastSyncBlocknumberForRegisterEvent}`);
      return;
    }
    const req: TsTxRegisterRequest = {
      reqType: TsTxType.REGISTER,
      L2AddrFrom: l2Addr.toString(),
      L2TokenAddr: TsTokenAddress.Unknown,
      amount: '0',
      tsPubKey: [tsPubKey[0].toString(), tsPubKey[1].toString()],
    };
    const res = await axios.post(`${this.config.get('TS_API_GATEWAY_URL', '')}/v1/ts/transaction`, req);
    this.logger.log(`OperatorProducer.listenRegisterEvent ${l1Addr} ${l2Addr} ${tsPubKey}`);
  }


}
