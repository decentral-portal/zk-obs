import { TsWorkerName } from '@ts-sdk/constant';
import { PinoLoggerService } from '@common/logger/adapters/real/pinoLogger.service';
import { BullWorker, BullWorkerProcess } from '@anchan828/nest-bullmq';
import { Job } from 'bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { BlockInformation } from 'common/ts-typeorm/src/account/blockInformation.entity';
import { TransactionInfo } from 'common/ts-typeorm/src/account/transactionInfo.entity';
import { Repository } from 'typeorm';
import { TS_STATUS } from 'common/ts-typeorm/src/account/tsStatus.enum';
import { recursiveToString } from '@ts-sdk/domain/lib/helper';
import { TsRollupConfigType, RollupStatus, CircuitAccountTxPayload, CircuitOrderTxPayload, CircuitNullifierTxPayload } from '@ts-sdk/domain/lib/ts-rollup/ts-rollup';
import { CircuitReqDataType, encodeRollupWithdrawMessage } from '@ts-sdk/domain/lib/ts-rollup/ts-rollup-helper';
import { txsToRollupCircuitInput, encodeRChunkBuffer, bigint_to_chunk_array } from '@ts-sdk/domain/lib/ts-rollup/ts-tx-helper';
import { TsRollupCircuitInputType, TsRollupCircuitInputItemType } from '@ts-sdk/domain/lib/ts-types/ts-circuit-types';
import { ObsOrderLeaf } from '@ts-sdk/domain/lib/ts-types/ts-req-types';
import { TxNoop, CHUNK_BITS_SIZE, MAX_CHUNKS_PER_REQ, TsTxType, TsSystemAccountAddress, TsTokenAddress } from '@ts-sdk/domain/lib/ts-types/ts-types';
import assert from 'assert';
import { dpPoseidonHash } from '@ts-sdk/domain/lib/poseidon-hash-dp';
import { TsAccountTreeService } from '@common/ts-typeorm/account/tsAccountTree.service';
import { TsTokenTreeService } from '@common/ts-typeorm/account/tsTokenTree.service';
import { ObsOrderTreeService } from '@common/ts-typeorm/auctionOrder/obsOrderTree.service';
import { AccountLeafNode } from '@common/ts-typeorm/account/accountLeafNode.entity';
import { ObsOrderLeafEntity } from '@common/ts-typeorm/auctionOrder/obsOrderLeaf.entity';
import { getDefaultAccountLeafMessage, getDefaultTokenLeafMessage } from '@common/ts-typeorm/account/helper/mkAccount.helper';
import { AccountInformation } from '@common/ts-typeorm/account/accountInformation.entity';

const DefaultRollupConfig: TsRollupConfigType = {
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

@BullWorker({
  queueName: TsWorkerName.SEQUENCER,
  options: {
    concurrency: 1,
  },
})
export class SequencerConsumer {
  @BullWorkerProcess({
    autorun: true,
  })
  async process(job: Job<TransactionInfo>) {
    this.logger.log(`SEQUENCER.process ${job.data.txId} start`);
    console.log({
      log: 'SEQUENCER.process start'
    });
    const req = await this.txRepository.findOne({
      where: {  
        txId: job.data.txId,
      },
    });
    if(!req) {
      this.logger.log(`SEQUENCER.process ${job.data.txId} not found`);
      return false;
    }
    req.txStatus = TS_STATUS.PROCESSING;
    this.txRepository.save(req);
    console.log({
      log: 'SEQUENCER.doTransaction start'
    });
    await this.doTransaction(req);
    this.logger.log(`SEQUENCER.process ${job.data.txId} done`);
    await this.txRepository.update(
      {
        txId: req.txId,
      },
      {
        txStatus: TS_STATUS.L2EXECUTED,
      },
    );
    return true;
  }

  constructor(
    private readonly logger: PinoLoggerService,
    @InjectRepository(TransactionInfo)
    private txRepository: Repository<TransactionInfo>,
    @InjectRepository(BlockInformation)
    private blockRepository: Repository<BlockInformation>,
    @InjectRepository(AccountLeafNode)
    private accountLeafNodeRepository: Repository<AccountLeafNode>,
    @InjectRepository(AccountInformation)
    private accountInfoRepository: Repository<AccountInformation>,
    private readonly tsAccountTreeService: TsAccountTreeService,  
    private readonly tsTokenTreeService: TsTokenTreeService,
    private readonly obsOrderTreeService: ObsOrderTreeService,
  ) {
    this.logger.log('SEQUENCER.process START');
    this.config = DefaultRollupConfig;
  }
  
  // ===============================
  // TODO: amt_size, l2_token_addr_size
  public config: TsRollupConfigType = DefaultRollupConfig;
  get txNormalPerBatch() {
    return this.config.numOfReqs;
  }
  get txRegisterPerBatch() {
    return this.config.register_batch_size;
  }

  public async stateRoot() {
    const accountTreeRoot = (await this.tsAccountTreeService.getRoot()).hash;
    const orderTreeRoot = (await this.obsOrderTreeService.getRoot()).hash;
    const oriTxNum = this.oriTxId;
    const oriTsRoot =
      '0x' +
      dpPoseidonHash([BigInt(orderTreeRoot), oriTxNum])
        .toString(16)
        .padStart(64, '0');
    const oriStateRoot =
      '0x' +
      dpPoseidonHash([BigInt(oriTsRoot), BigInt(accountTreeRoot)])
        .toString(16)
        .padStart(64, '0');
    return oriStateRoot;
  }
  public rollupStatus: RollupStatus = RollupStatus.Idle;

  private currentOrderId = 1; // 0 is default empty order

  /** Block information */
  public blockNumber = 0n;
  public oriTxId = 0n;
  get latestTxId() {
    return this.oriTxId + BigInt(this.currentTxLogs.length);
  }
  private currentTxLogs: any[] = [];
  private currentAccountRootFlow: bigint[] = [];
  private currentOrderRootFlow: bigint[] = [];
  /** Transaction Information */
  private currentAccountPayload: CircuitAccountTxPayload = this.prepareTxAccountPayload();
  private currentOrderPayload: CircuitOrderTxPayload = this.prepareTxOrderPayload();

  private blockLogs: Map<
    string,
    {
      logs: any[];
      accountRootFlow: bigint[];
      auctionOrderRootFlow: bigint[];
    }
  > = new Map();

  /** Order */
  async getObsOrder(orderId: bigint): Promise<ObsOrderLeafEntity | null> {
    return await this.obsOrderTreeService.getLeaf(orderId);
  }

  /** Account */
  async getAccount(accAddr: bigint): Promise<AccountLeafNode | null> {
    const acc = await this.tsAccountTreeService.getLeaf(accAddr);

    if (acc.tsAddr === 0n) {
      // TODO: check account is exist
      return null;
    }
    return acc;
  }

  addAccount(l2addr: bigint, account: {
    l2Addr: bigint;
    tsAddr: bigint;
  }): bigint {
    // TODO: check account is exist
    // TODO: check register has tokenInfo
    this.tsAccountTreeService.addLeaf({
      leafId: l2addr.toString(),
      tsAddr: account.tsAddr.toString(),
    });
    return l2addr;
  }

  private async updateAccountToken(accountId: bigint, tokenAddr: TsTokenAddress, tokenAmt: bigint, lockedAmt: bigint) {
    const acc = this.getAccount(accountId);
    if (!acc) {
      throw new Error(`updateAccountToken: account id=${accountId} not found`);
    }
    await this.tsAccountTreeService.updateTokenLeaf(BigInt(tokenAddr), {
      lockedAmt: lockedAmt.toString(),
      availableAmt: tokenAmt.toString(),
      leafId: tokenAddr,
      accountId: accountId.toString(),
    });
  }
  private async updateAccountNonce(accountId: bigint, nonce: bigint) {
    const acc = await this.getAccount(accountId);
    if (!acc) {
      throw new Error(`updateAccountNonce: account id=${accountId} not found`);
    }
    await this.tsAccountTreeService.updateLeaf(accountId, {
      leafId: accountId.toString(),
      nonce: nonce.toString(),
    });
  }

  /** Rollup trace */
  private addFirstRootFlow() {
    if (this.currentAccountRootFlow.length !== 0 || this.currentOrderRootFlow.length !== 0) {
      throw new Error('addFirstRootFlow must run on new block');
    }
    this.addAccountRootFlow();
    this.addOrderRootFlow();
  }

  private flushBlock(blocknumber: bigint) {
    if (this.blockLogs.has(blocknumber.toString())) {
      throw new Error(`Block ${blocknumber} already exist`);
    }
    const logs = { ...this.currentTxLogs };
    const accountRootFlow = [...this.currentAccountRootFlow];
    const auctionOrderRootFlow = [...this.currentOrderRootFlow];
    this.blockNumber = blocknumber;
    this.currentAccountRootFlow = [];
    this.currentOrderRootFlow = [];
    this.currentTxLogs = [];

    this.currentAccountPayload = this.prepareTxAccountPayload();
    this.currentOrderPayload = this.prepareTxOrderPayload();

    // TODO: blockLogs
    this.blockLogs.set(blocknumber.toString(), {
      logs,
      accountRootFlow,
      auctionOrderRootFlow,
    });
  }

  private async addAccountRootFlow() {
    const root = await this.tsAccountTreeService.getRoot();
    this.currentAccountRootFlow.push(BigInt(root.hash));
  }

  private async addOrderRootFlow() {
    const root = await this.obsOrderTreeService.getRoot();
    this.currentOrderRootFlow.push(BigInt(root.hash));
  }

  private addTxLogs(detail: any) {
    this.currentTxLogs.push(detail);
  }

  /** Rollup Transaction */
  public newBlockNumber = 0n;
  async startRollup(): Promise<{
    blockNumber: bigint;
  }> {
    if (this.rollupStatus === RollupStatus.Running) {
      throw new Error('Rollup is running');
    }
    this.rollupStatus = RollupStatus.Running;

    this.newBlockNumber = this.blockNumber + 1n;
    this.addFirstRootFlow();
    // TODO: rollback state if callback failed
    // await callback(this, this.newBlockNumber);

    return {
      blockNumber: this.newBlockNumber,
    };
  }

  async endRollup(): Promise<{
    inputs: TsRollupCircuitInputType;
  }> {
    const perBatch = this.txNormalPerBatch;
    if (this.currentTxLogs.length !== perBatch) {
      console.log(`Rollup txNumbers=${this.currentTxLogs.length} not match txPerBatch=${perBatch}`);
      const emptyTxNum = perBatch - this.currentTxLogs.length;
      for (let i = 0; i < emptyTxNum; i++) {
        await this.doTransaction(TxNoop);
      }
    }
    // const circuitInputs = exportTransferCircuitInput(this.currentTxLogs, this.txId, this.currentAccountRootFlow, this.currentAuctionOrderRootFlow);

    const circuitInputs = txsToRollupCircuitInput(this.currentTxLogs) as any;
    // TODO: type check

    circuitInputs['o_chunks'] = circuitInputs['o_chunks'].flat();
    const o_chunk_remains = this.config.numOfChunks - circuitInputs['o_chunks'].length;
    circuitInputs['isCriticalChunk'] = circuitInputs['isCriticalChunk'].flat();
    assert(
      circuitInputs['isCriticalChunk'].length === circuitInputs['o_chunks'].length,
      `isCriticalChunk=${circuitInputs['isCriticalChunk'].length} length not match o_chunks=${circuitInputs['o_chunks'].length} `,
    );
    for (let index = 0; index < o_chunk_remains; index++) {
      circuitInputs['o_chunks'].push('0');
      circuitInputs['isCriticalChunk'].push('0');
    }
    assert(
      circuitInputs['o_chunks'].length === this.config.numOfChunks,
      `o_chunks=${circuitInputs['o_chunks'].length} length not match numOfChunks=${this.config.numOfChunks} `,
    );
    assert(
      circuitInputs['isCriticalChunk'].length === this.config.numOfChunks,
      `isCriticalChunk=${circuitInputs['isCriticalChunk'].length} length not match numOfChunks=${this.config.numOfChunks} `,
    );
    // TODO: hotfix
    circuitInputs['r_accountLeafId'] = circuitInputs['r_accountLeafId'][0];
    circuitInputs['r_oriAccountLeaf'] = circuitInputs['r_oriAccountLeaf'][0];
    circuitInputs['r_newAccountLeaf'] = circuitInputs['r_newAccountLeaf'][0];
    circuitInputs['r_accountRootFlow'] = circuitInputs['r_accountRootFlow'][0];
    circuitInputs['r_accountMkPrf'] = circuitInputs['r_accountMkPrf'][0];
    circuitInputs['r_tokenLeafId'] = circuitInputs['r_tokenLeafId'][0];
    circuitInputs['r_oriTokenLeaf'] = circuitInputs['r_oriTokenLeaf'][0];
    circuitInputs['r_newTokenLeaf'] = circuitInputs['r_newTokenLeaf'][0];
    circuitInputs['r_tokenRootFlow'] = circuitInputs['r_tokenRootFlow'][0];
    circuitInputs['r_tokenMkPrf'] = circuitInputs['r_tokenMkPrf'][0];
    circuitInputs['r_orderLeafId'] = circuitInputs['r_orderLeafId'][0];
    circuitInputs['r_oriOrderLeaf'] = circuitInputs['r_oriOrderLeaf'][0];
    circuitInputs['r_newOrderLeaf'] = circuitInputs['r_newOrderLeaf'][0];
    circuitInputs['r_orderRootFlow'] = circuitInputs['r_orderRootFlow'][0];
    circuitInputs['r_orderMkPrf'] = circuitInputs['r_orderMkPrf'][0];

    circuitInputs['oriTxNum'] = this.oriTxId.toString();
    circuitInputs['accountRootFlow'] = this.currentAccountRootFlow.map((x) => recursiveToString(x));
    circuitInputs['orderRootFlow'] = this.currentOrderRootFlow.map((x) => recursiveToString(x));
    this.oriTxId = this.latestTxId;
    this.flushBlock(this.newBlockNumber);
    this.rollupStatus = RollupStatus.Idle;

    return {
      inputs: circuitInputs,
    };
  }

  private prepareTxAccountPayload() {
    return {
      r_accountLeafId: [],
      r_oriAccountLeaf: [],
      r_newAccountLeaf: [],
      r_accountRootFlow: [],
      r_accountMkPrf: [],
      r_tokenLeafId: [],
      r_oriTokenLeaf: [],
      r_newTokenLeaf: [],
      r_tokenRootFlow: [],
      r_tokenMkPrf: [],
    } as CircuitAccountTxPayload;
  }

  private prepareTxOrderPayload() {
    return {
      r_orderLeafId: [],
      r_oriOrderLeaf: [],
      r_newOrderLeaf: [],
      r_orderRootFlow: [],
      r_orderMkPrf: [],
    } as CircuitOrderTxPayload;
  }

  private prepareTxNullifierPayload() {
    return {
      r_nullifierLeafId: [],
      r_oriNullifierLeaf: [],
      r_newNullifierLeaf: [],
      r_nullifierRootFlow: [],
      r_nullifierMkPrf: [],
    } as CircuitNullifierTxPayload;
  }

  private async tokenBeforeUpdate(accountLeafId: bigint, tokenAddr: TsTokenAddress) {
    const account = this.getAccount(accountLeafId);
    if (this.currentAccountPayload.r_tokenLeafId[this.currentAccountPayload.r_tokenLeafId.length - 1]?.length === 1) {
      this.currentAccountPayload.r_tokenLeafId[this.currentAccountPayload.r_tokenLeafId.length - 1].push(tokenAddr);
    } else {
      this.currentAccountPayload.r_tokenLeafId.push([tokenAddr]);
    }
    if (!account) {
      const mkp = await this.tsTokenTreeService.getMerklerProofByAccountId(0n, '0');
      this.currentAccountPayload.r_tokenRootFlow.push([this.tsTokenTreeService.getDefaultRoot()]);
      this.currentAccountPayload.r_oriTokenLeaf.push(getDefaultTokenLeafMessage());
      this.currentAccountPayload.r_tokenMkPrf.push(mkp);
    } else {
      const tokenInfo = await this.tsTokenTreeService.getLeaf(BigInt(tokenAddr), accountLeafId.toString());
      const tokenRoot = await this.tsTokenTreeService.getRoot(accountLeafId.toString());
      const mkPrf = await this.tsTokenTreeService.getMerklerProofByAccountId(BigInt(tokenAddr), accountLeafId.toString());
      this.currentAccountPayload.r_tokenRootFlow.push([tokenRoot.hash]);
      this.currentAccountPayload.r_oriTokenLeaf.push(tokenInfo.encode());
      this.currentAccountPayload.r_tokenMkPrf.push(mkPrf);
    }
  }
  private async tokenAfterUpdate(accountLeafId: bigint, tokenAddr: TsTokenAddress) {
    const account = this.getAccount(accountLeafId);
    if (!account) {
      throw new Error('accountAfterUpdate: account not found');
    }
    const tokenInfo = await this.tsTokenTreeService.getLeaf(BigInt(tokenAddr), accountLeafId.toString());
    const tokenRoot = await this.tsTokenTreeService.getRoot(accountLeafId.toString());

    const idx = this.currentAccountPayload.r_tokenRootFlow.length - 1;
    this.currentAccountPayload.r_newTokenLeaf.push(tokenInfo.encode());
    this.currentAccountPayload.r_tokenRootFlow[idx].push(tokenRoot.hash);
  }
  private async accountBeforeUpdate(accountLeafId: bigint) {
    const account = await this.getAccount(accountLeafId);
    if (this.currentAccountPayload.r_accountLeafId[this.currentAccountPayload.r_accountLeafId.length - 1]?.length === 1) {
      this.currentAccountPayload.r_accountLeafId[this.currentAccountPayload.r_accountLeafId.length - 1].push(accountLeafId);
    } else {
      this.currentAccountPayload.r_accountLeafId.push([accountLeafId]);
    }
    if (!account) {
      const mkp = await this.tsAccountTreeService.getMerklerProof(0n);
      const root = await this.tsAccountTreeService.getRoot();
      const tokenRoot = await this.tsTokenTreeService.getRoot(accountLeafId.toString());
      const leaf = getDefaultAccountLeafMessage(tokenRoot.hash);
      this.currentAccountPayload.r_oriAccountLeaf.push(leaf);
      this.currentAccountPayload.r_accountRootFlow.push([root.hash]);
      this.currentAccountPayload.r_accountMkPrf.push(mkp);
    } else {
      const mkp = await this.tsAccountTreeService.getMerklerProof(accountLeafId);
      const leaf = await this.tsAccountTreeService.getLeaf(accountLeafId);
      const root = await this.tsAccountTreeService.getRoot();
      this.currentAccountPayload.r_oriAccountLeaf.push(leaf.encode());
      this.currentAccountPayload.r_accountRootFlow.push([root]);
      this.currentAccountPayload.r_accountMkPrf.push(mkp);
    }
  }
  private async accountAfterUpdate(accountLeafId: bigint) {
    const account = await this.getAccount(accountLeafId);
    if (!account) {
      throw new Error('accountAfterUpdate: account not found');
    }
    const idx = this.currentAccountPayload.r_accountRootFlow.length - 1;
    const root = await this.tsAccountTreeService.getRoot();
    this.currentAccountPayload.r_newAccountLeaf.push(account.encode());
    this.currentAccountPayload.r_accountRootFlow[idx].push(root);
  }

  private async accountAndTokenBeforeUpdate(accountLeafId: bigint, tokenAddr: TsTokenAddress) {
    const account = this.getAccount(accountLeafId);
    if (this.currentAccountPayload.r_accountLeafId[this.currentAccountPayload.r_accountLeafId.length - 1]?.length === 1) {
      this.currentAccountPayload.r_accountLeafId[this.currentAccountPayload.r_accountLeafId.length - 1].push(accountLeafId);
    } else {
      this.currentAccountPayload.r_accountLeafId.push([accountLeafId]);
    }
    if (this.currentAccountPayload.r_tokenLeafId[this.currentAccountPayload.r_tokenLeafId.length - 1]?.length === 1) {
      this.currentAccountPayload.r_tokenLeafId[this.currentAccountPayload.r_tokenLeafId.length - 1].push(tokenAddr);
    } else {
      this.currentAccountPayload.r_tokenLeafId.push([tokenAddr]);
    }
    const root = await this.tsAccountTreeService.getRoot();
    this.currentAccountPayload.r_accountRootFlow.push([root]);
    if (!account) {
      const tokenRoot = await this.tsTokenTreeService.getRoot(accountLeafId.toString());
      const leaf = getDefaultAccountLeafMessage(tokenRoot.hash);
      const AccountMkp = await this.tsAccountTreeService.getMerklerProof(0n);
      const tokenMkp = await this.tsTokenTreeService.getMerklerProofByAccountId(0n, '0');

      this.currentAccountPayload.r_oriAccountLeaf.push(leaf);
      this.currentAccountPayload.r_accountMkPrf.push(AccountMkp);
      this.currentAccountPayload.r_tokenRootFlow.push([this.tsTokenTreeService.getDefaultRoot()]);
      this.currentAccountPayload.r_oriTokenLeaf.push(getDefaultTokenLeafMessage());
      this.currentAccountPayload.r_tokenMkPrf.push(tokenMkp);
    } else {
      const accountMkp = await this.tsAccountTreeService.getMerklerProof(accountLeafId);
      const accountLeaf = await this.tsAccountTreeService.getLeaf(accountLeafId);
      const accountRoot = await this.tsAccountTreeService.getRoot();
      const tokenInfo = await this.tsTokenTreeService.getLeaf(BigInt(tokenAddr), accountLeafId.toString());
      const tokenRoot = await this.tsTokenTreeService.getRoot(accountLeafId.toString());
      const tokenMkPr = await this.tsTokenTreeService.getMerklerProofByAccountId(BigInt(tokenAddr), accountLeafId.toString());

      this.currentAccountPayload.r_oriAccountLeaf.push(accountLeaf.encode());
      this.currentAccountPayload.r_accountRootFlow.push([accountRoot]);
      this.currentAccountPayload.r_accountMkPrf.push(accountMkp);
      this.currentAccountPayload.r_tokenRootFlow.push([tokenRoot.hash]);
      this.currentAccountPayload.r_oriTokenLeaf.push(tokenInfo.encode());
      this.currentAccountPayload.r_tokenMkPrf.push(tokenMkPr);
    }
  }

  private async accountAndTokenAfterUpdate(accountLeafId: bigint, tokenAddr: TsTokenAddress) {
    const account = this.getAccount(accountLeafId);
    if (!account) {
      throw new Error('accountAfterUpdate: account not found');
    }
    const tokenInfo = await this.tsTokenTreeService.getLeaf(BigInt(tokenAddr), accountLeafId.toString());
    const tokenRoot = await this.tsTokenTreeService.getRoot(accountLeafId.toString());
    const accountRoot = await this.tsAccountTreeService.getRoot();
    const accountLeaf = await this.tsAccountTreeService.getLeaf(accountLeafId);
    const idx = this.currentAccountPayload.r_accountRootFlow.length - 1;
    this.currentAccountPayload.r_newAccountLeaf.push(accountLeaf.encode());
    this.currentAccountPayload.r_accountRootFlow[idx].push(accountRoot);
    this.currentAccountPayload.r_newTokenLeaf.push(tokenInfo.encode());

    this.currentAccountPayload.r_tokenRootFlow[idx].push(tokenRoot.hash);
  }

  private orderBeforeUpdate(orderLeafId: number) {
    // const order = this.getObsOrder(orderLeafId);
    // this.currentOrderPayload.r_orderLeafId.push([orderLeafId.toString()]);

    // if (order) {
    //   this.currentOrderPayload.r_oriOrderLeaf.push(order.encodeLeafMessage());
    //   this.currentOrderPayload.r_orderRootFlow.push([BigInt(this.mkOrderTree.getRoot()).toString()]);
    //   this.currentOrderPayload.r_orderMkPrf.push(this.mkOrderTree.getProof(orderLeafId));
    // } else {
    //   const defaultOrderLeaf = this.obsOrderTreeService.getLeafDefaultVavlue();
    //   this.currentOrderPayload.r_oriOrderLeaf.push(this.getDefaultOrder().encodeLeafMessage());
    //   this.currentOrderPayload.r_orderRootFlow.push([BigInt(this.mkOrderTree.getRoot()).toString()]);
    //   this.currentOrderPayload.r_orderMkPrf.push(this.mkOrderTree.getProof(orderLeafId));
    // }
  }

  private orderAfterUpdate(orderLeafId: number) {
    // const order = this.getObsOrder(orderLeafId);
    // this.currentOrderPayload.r_orderRootFlow[this.currentOrderPayload.r_orderRootFlow.length - 1].push(BigInt(this.mkOrderTree.getRoot()).toString());
    // if (order) {
    //   this.currentOrderPayload.r_newOrderLeaf.push(order.encodeLeafMessage());
    //   // this.currentOrderPayload.r_orderMkPrf.push(this.mkOrderTree.getProof(orderLeafId));
    // } else {
    //   this.currentOrderPayload.r_newOrderLeaf.push(this.getDefaultOrder().encodeLeafMessage());
    // }
  }

  private addObsOrder(order: ObsOrderLeaf) {
    // if (order.orderLeafId > 0n) {
    //   throw new Error('addObsOrder: orderLeafId should be 0');
    // }
    // order.setOrderLeafId(BigInt(this.currentOrderId));
    // this.orderMap[this.currentOrderId] = order;
    // this.mkOrderTree.updateLeafNode(this.currentOrderId, order.encodeLeafMessageForHash());
    // this.currentOrderId++;
  }
  private removeObsOrder(leafId: number) {
    // const order = this.getObsOrder(leafId);
    // if (!order) {
    //   throw new Error('removeObsOrder: order not found');
    // }
    // this.orderMap[leafId] = this.getDefaultOrder();
    // this.mkOrderTree.updateLeafNode(leafId, this.orderMap[leafId].encodeLeafMessageForHash());
  }
  private updateObsOrder(order: ObsOrderLeaf) {
    // assert(order.orderLeafId > 0n, 'updateObsOrder: orderLeafId should be exist');
    // this.orderMap[this.currentOrderId] = order;
    // this.mkOrderTree.updateLeafNode(this.currentOrderId, order.encodeLeafMessageForHash());
  }

  private getTxChunks(
    txEntity: TransactionInfo,
    metadata?: {
      txOffset: bigint;
      makerBuyAmt: bigint;
    },
  ) {
    const { r_chunks, o_chunks, isCritical } = encodeRChunkBuffer(txEntity, metadata);

    // TODO multiple txs need handle o_chunks in end of block;
    const r_chunks_bigint = bigint_to_chunk_array(BigInt('0x' + r_chunks.toString('hex')), BigInt(CHUNK_BITS_SIZE));
    const o_chunks_bigint = bigint_to_chunk_array(BigInt('0x' + o_chunks.toString('hex')), BigInt(CHUNK_BITS_SIZE));
    const isCriticalChunk = o_chunks_bigint.map((_) => '0');
    if (isCritical) {
      isCriticalChunk[0] = '1';
    }

    return { r_chunks_bigint, o_chunks_bigint, isCriticalChunk };
  }

  async doTransaction(req: TransactionInfo): Promise<TsRollupCircuitInputItemType> {
    if (this.rollupStatus === RollupStatus.Running) {
      await this.startRollup();
    }
    let inputs: TsRollupCircuitInputItemType;
    const reqType = req.reqType;
    switch (reqType) {
      case TsTxType.REGISTER:
        inputs = await this.doRegister(req);
        break;
      case TsTxType.DEPOSIT:
        inputs = await this.doDeposit(req);
        break;
      case TsTxType.WITHDRAW:
        inputs = await this.doWithdraw(req);
        break;
      // case TsTxType.SecondLimitOrder:
      //   inputs = await this.doSecondLimitOrder(req);
      //   break;
      // case TsTxType.SecondLimitStart:
      //   inputs = await this.doSecondLimitStart(req);
      //   break;
      // case TsTxType.SecondLimitExchange:
      //   inputs = await this.doSecondLimitExchange(req);
      //   break;
      // case TsTxType.SecondLimitEnd:
      //   inputs = await this.doSecondLimitEnd(req);
      //   break;
      case TsTxType.NOOP:
        inputs = await this.doNoop();
        break;
      // case TsTxType.SecondMarketOrder:
      //   return this.doSecondLimitOrder(req);
      // case TsTxType.SecondMarketExchange:
      //   return this.doSecondLimitExchange(req);
      // case TsTxType.SecondMarketEnd:
      //   return this.doSecondMarketEnd(req);
      case TsTxType.UNKNOWN:
      default:
        throw new Error(`Unknown request type reqType=${req.reqType}`);
    }

    this.addAccountRootFlow();
    this.addOrderRootFlow();

    const remains = this.txNormalPerBatch - this.currentTxLogs.length;
    if (remains < 3) {
      await this.endRollup();
    }
    return inputs;
  }

  private async doSecondLimitOrder(req: TransactionInfo): Promise<TsRollupCircuitInputItemType> {
    const reqData: CircuitReqDataType = [
      BigInt(TsTxType.SecondLimitOrder),
      BigInt(req.accountId),
      BigInt(req.tokenAddr),
      BigInt(req.amount),
      BigInt(req.nonce),
      0n,
      0n,
      BigInt(req.arg2),
      BigInt(req.arg3),
      0n,
    ];
    const from = await this.getAccount(req.accountId);
    if (!from) {
      throw new Error(`account not found L2Addr=${from}`);
    }
    const newNonce = from.nonce + 1n;
    const tokenAddr = req.tokenAddr;

    this.accountAndTokenBeforeUpdate(req.accountId, tokenAddr);
    this.updateAccountToken(req.accountId, tokenAddr, -BigInt(req.amount), BigInt(req.amount));
    this.updateAccountNonce(req.accountId, newNonce);
    this.accountAndTokenAfterUpdate(req.accountId, tokenAddr);

    this.accountAndTokenBeforeUpdate(req.accountId, tokenAddr);
    this.accountAndTokenAfterUpdate(req.accountId, tokenAddr);

    const orderLeafId = this.currentOrderId;
    const txId = this.latestTxId;
    const order = new ObsOrderLeaf(
      txId,
      req.reqType as TsTxType,
      req.accountId,
      req.tokenId,
      req.amount,
      req.nonce,
      req.arg2,
      req.arg3,
      0n,
      0n,
    );
    console.log({
      add: order,
    });
    this.orderBeforeUpdate(orderLeafId);
    this.addObsOrder(order);
    // await this.addAuctionOrder(req.reqType, txId, req as unknown as TsTxAuctionLendRequest | TsTxAuctionBorrowRequest);
    this.orderAfterUpdate(orderLeafId);

    const { r_chunks_bigint, o_chunks_bigint, isCriticalChunk } = this.getTxChunks(req);

    const tx = {
      reqData,
      // tsPubKey: from.tsPubKey, // Deposit tx not need signature
      sigR: req.eddsaSig.R8,
      sigS: req.eddsaSig.S,

      // chunkSize * MaxTokenUnitsPerReq
      r_chunks: r_chunks_bigint,
      // TODO: handle reach o_chunks max length
      o_chunks: o_chunks_bigint,
      isCriticalChunk,
      ...this.currentAccountPayload,
      ...this.currentOrderPayload,
    };

    this.addTxLogs(tx);
    return tx as unknown as TsRollupCircuitInputItemType;
  }

  private currentHoldTakerOrder: ObsOrderLeaf | null = null;
  // doSecondLimitStart(req: TransactionInfo) {
  //   const reqData: CircuitReqDataType = [BigInt(TsTxType.SecondLimitStart), 0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n, req.arg4];
  //   const orderLeafId = Number(req.arg4);
  //   const order = this.getObsOrder(orderLeafId);
  //   if (!order) {
  //     throw new Error(`doCancelOrder: order not found orderLeafId=${orderLeafId}`);
  //   }
  //   if (order.sender === 0n) {
  //     throw new Error(`doCancelOrder: order not found orderLeafId=${orderLeafId} (order.sender=0)`);
  //   }
  //   this.currentHoldTakerOrder = order;
  //   const from = this.getAccount(order.sender);
  //   if (!from) {
  //     throw new Error(`account not found L2Addr=${from}`);
  //   }
  //   const sellTokenId = order.sellTokenId.toString() as TsTokenAddress;

  //   this.accountAndTokenBeforeUpdate(order.sender, sellTokenId);
  //   this.accountAndTokenAfterUpdate(order.sender, sellTokenId);
  //   this.accountAndTokenBeforeUpdate(order.sender, sellTokenId);
  //   this.accountAndTokenAfterUpdate(order.sender, sellTokenId);

  //   this.orderBeforeUpdate(orderLeafId);
  //   this.removeObsOrder(orderLeafId);
  //   this.orderAfterUpdate(orderLeafId);

  //   const txId = this.latestTxId;
  //   const { r_chunks_bigint, o_chunks_bigint, isCriticalChunk } = this.getTxChunks(req, {
  //     txOffset: txId - order.txId,
  //     makerBuyAmt: 0n,
  //   });

  //   const tx = {
  //     reqData,
  //     tsPubKey: from.tsPubKey, // Deposit tx not need signature
  //     sigR: ['0', '0'],
  //     sigS: '0',

  //     r_chunks: r_chunks_bigint,
  //     o_chunks: o_chunks_bigint,
  //     isCriticalChunk,
  //     ...this.currentAccountPayload,
  //     ...this.currentOrderPayload,
  //   };

  //   this.addTxLogs(tx);
  //   return tx as unknown as TsRollupCircuitInputItemType;
  // }
  // doSecondLimitExchange(req: TransactionInfo) {
  //   const reqData: CircuitReqDataType = [BigInt(TsTxType.SecondLimitExchange), 0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n, req.arg4];
  //   const orderLeafId = Number(req.arg4);
  //   const makerOrder = this.getObsOrder(orderLeafId);
  //   if (!makerOrder) {
  //     throw new Error(`doCancelOrder: order not found orderLeafId=${orderLeafId}`);
  //   }
  //   if (makerOrder.sender === 0n) {
  //     throw new Error(`doCancelOrder: order not found orderLeafId=${orderLeafId} (order.sender=0)`);
  //   }
  //   const makerAcc = this.getAccount(makerOrder.sender);
  //   if (!makerAcc) {
  //     throw new Error(`account not found L2Addr=${makerOrder.sender}`);
  //   }
  //   const sellTokenId = makerOrder.sellTokenId.toString() as TsTokenAddress;
  //   const buyTokenId = makerOrder.buyTokenId.toString() as TsTokenAddress;

  //   console.log({
  //     makerOrder,
  //     makerOrderAmout: makerOrder.sellAmt,
  //     makerOrderBuyAmout: makerOrder.buyAmt,
  //     makerOrderAccumulated: req.accumulatedSellAmt,
  //   });
  //   this.accountBeforeUpdate(makerOrder.sender);

  //   this.tokenBeforeUpdate(makerOrder.sender, buyTokenId);
  //   this.updateAccountToken(makerAcc.L2Address, buyTokenId, req.accumulatedBuyAmt, 0n);
  //   this.tokenAfterUpdate(makerOrder.sender, buyTokenId);

  //   this.tokenBeforeUpdate(makerOrder.sender, sellTokenId);
  //   this.updateAccountToken(makerAcc.L2Address, sellTokenId, 0n, -req.accumulatedSellAmt);
  //   this.tokenAfterUpdate(makerOrder.sender, sellTokenId);

  //   this.accountAfterUpdate(makerOrder.sender);

  //   this.accountBeforeUpdate(makerOrder.sender);
  //   this.accountAfterUpdate(makerOrder.sender);

  //   this.orderBeforeUpdate(orderLeafId);
  //   makerOrder.accumulatedSellAmt += req.accumulatedSellAmt;
  //   makerOrder.accumulatedBuyAmt += req.accumulatedBuyAmt;
  //   const isAllSellAmtMatched = makerOrder.accumulatedSellAmt === makerOrder.sellAmt;
  //   if (isAllSellAmtMatched) {
  //     this.removeObsOrder(orderLeafId);
  //   } else {
  //     this.updateObsOrder(makerOrder);
  //   }
  //   this.orderAfterUpdate(orderLeafId);

  //   const txId = this.latestTxId;
  //   const { r_chunks_bigint, o_chunks_bigint, isCriticalChunk } = this.getTxChunks(req, {
  //     txOffset: txId - makerOrder.txId,
  //     makerBuyAmt: makerOrder.buyAmt,
  //   });

  //   const tx = {
  //     reqData,
  //     tsPubKey: makerAcc.tsPubKey, // Deposit tx not need signature
  //     sigR: ['0', '0'],
  //     sigS: '0',

  //     r_chunks: r_chunks_bigint,
  //     o_chunks: o_chunks_bigint,
  //     isCriticalChunk,
  //     ...this.currentAccountPayload,
  //     ...this.currentOrderPayload,
  //   };

  //   this.addTxLogs(tx);
  //   return tx as unknown as TsRollupCircuitInputItemType;
  // }
  // doSecondLimitEnd(req: TransactionInfo) {
  //   assert(!!this.currentHoldTakerOrder, 'doSecondLimitEnd: currentHoldTakerOrder is null');
  //   const reqData: CircuitReqDataType = [BigInt(TsTxType.SecondLimitEnd), 0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n, req.arg4];
  //   const orderLeafId = Number(req.arg4);
  //   assert(orderLeafId === Number(this.currentHoldTakerOrder.orderLeafId), 'doSecondLimitEnd: orderLeafId not match');
  //   const takerOrder = this.currentHoldTakerOrder;
  //   if (!takerOrder) {
  //     throw new Error(`doSecondLimitEnd: order not found orderLeafId=${orderLeafId}`);
  //   }
  //   if (takerOrder.sender === 0n) {
  //     throw new Error(`doSecondLimitEnd: order not found orderLeafId=${orderLeafId} (order.sender=0)`);
  //   }
  //   const takerAcc = this.getAccount(takerOrder.sender);
  //   if (!takerAcc) {
  //     throw new Error(`account not found L2Addr=${takerOrder.sender}`);
  //   }
  //   const sellTokenId = takerOrder.sellTokenId.toString() as TsTokenAddress;
  //   const buyTokenId = takerOrder.buyTokenId.toString() as TsTokenAddress;
  //   this.accountBeforeUpdate(takerOrder.sender);

  //   this.tokenBeforeUpdate(takerOrder.sender, buyTokenId);
  //   this.updateAccountToken(takerAcc.L2Address, buyTokenId, req.accumulatedBuyAmt, 0n);
  //   this.tokenAfterUpdate(takerOrder.sender, buyTokenId);

  //   this.tokenBeforeUpdate(takerOrder.sender, sellTokenId);
  //   this.updateAccountToken(takerAcc.L2Address, sellTokenId, 0n, -req.accumulatedSellAmt);
  //   this.tokenAfterUpdate(takerOrder.sender, sellTokenId);

  //   this.accountAfterUpdate(takerOrder.sender);

  //   this.accountBeforeUpdate(takerOrder.sender);
  //   this.accountAfterUpdate(takerOrder.sender);

  //   this.orderBeforeUpdate(orderLeafId);
  //   takerOrder.accumulatedSellAmt += req.accumulatedSellAmt;
  //   takerOrder.accumulatedBuyAmt += req.accumulatedBuyAmt;
  //   const isAllSellAmtMatched = takerOrder.accumulatedSellAmt === takerOrder.sellAmt;
  //   if (isAllSellAmtMatched) {
  //     this.removeObsOrder(orderLeafId);
  //   } else {
  //     this.updateObsOrder(takerOrder);
  //   }
  //   this.orderAfterUpdate(orderLeafId);

  //   const txId = this.latestTxId;
  //   const { r_chunks_bigint, o_chunks_bigint, isCriticalChunk } = this.getTxChunks(req, {
  //     txOffset: txId - takerOrder.txId,
  //     makerBuyAmt: 0n,
  //   });

  //   this.currentHoldTakerOrder = null;
  //   const tx = {
  //     reqData,
  //     tsPubKey: takerAcc.tsPubKey, // Deposit tx not need signature
  //     sigR: ['0', '0'],
  //     sigS: '0',

  //     r_chunks: r_chunks_bigint,
  //     o_chunks: o_chunks_bigint,
  //     isCriticalChunk,
  //     ...this.currentAccountPayload,
  //     ...this.currentOrderPayload,
  //   };

  //   this.addTxLogs(tx);
  //   return tx as unknown as TsRollupCircuitInputItemType;
  // }

  // doCancelOrder(req: TransactionInfo) {
  //   const orderLeafId = req.arg4;
  //   const reqData: CircuitReqDataType = [BigInt(TsTxType.CancelOrder), 0n, 0n, 0n, 0n, req.arg0, orderLeafId, 0n, 0n, 0n];
  //   const order = this.getObsOrder(Number(orderLeafId));
  //   if (!order) {
  //     throw new Error(`doCancelOrder: order not found orderLeafId=${orderLeafId}`);
  //   }
  //   if (order.sender === 0n) {
  //     throw new Error(`doCancelOrder: order not found orderLeafId=${orderLeafId} (order.sender=0)`);
  //   }
  //   const account = this.getAccount(order.sender);
  //   if (!account) {
  //     throw new Error(`doCancelOrder: account not found L2Addr=${order.sender}`);
  //   }
  //   if (req.arg0 !== account.L2Address) {
  //     throw new Error(`doCancelOrder: account not match L2Addr=${order.sender} req.arg0=${req.arg0}`);
  //   }
  //   const refundTokenAddr = order.sellTokenId.toString() as TsTokenAddress;
  //   const refundAmount = order.sellAmt - order.accumulatedSellAmt;

  //   this.accountAndTokenBeforeUpdate(account.L2Address, refundTokenAddr);
  //   this.updateAccountToken(account.L2Address, refundTokenAddr, BigInt(refundAmount), -BigInt(refundAmount));
  //   this.accountAndTokenAfterUpdate(account.L2Address, refundTokenAddr);
  //   this.accountAndTokenBeforeUpdate(account.L2Address, refundTokenAddr);
  //   this.accountAndTokenAfterUpdate(account.L2Address, refundTokenAddr);

  //   this.orderBeforeUpdate(Number(order));
  //   this.removeObsOrder(Number(order));
  //   this.orderAfterUpdate(Number(order));

  //   const { r_chunks_bigint, o_chunks_bigint, isCriticalChunk } = this.getTxChunks(req);

  //   const tx = {
  //     reqData,
  //     tsPubKey: account.tsPubKey, // Deposit tx not need signature
  //     sigR: req.eddsaSig.R8,
  //     sigS: req.eddsaSig.S,

  //     // chunkSize * MaxTokenUnitsPerReq
  //     r_chunks: r_chunks_bigint,
  //     // TODO: handle reach o_chunks max length
  //     o_chunks: o_chunks_bigint,
  //     isCriticalChunk,
  //     ...this.currentAccountPayload,
  //     ...this.currentOrderPayload,
  //   };

  //   this.addTxLogs(tx);
  //   return tx as unknown as TsRollupCircuitInputItemType;
  // }

  private async doNoop() {
    const orderLeafId = 0;
    const account = await this.getAccount(0n);
    if (!account) {
      throw new Error('doNoop: account not found');
    }
    this.accountAndTokenBeforeUpdate(0n, TsTokenAddress.Unknown);
    this.accountAndTokenAfterUpdate(0n, TsTokenAddress.Unknown);
    this.accountAndTokenBeforeUpdate(0n, TsTokenAddress.Unknown);
    this.accountAndTokenAfterUpdate(0n, TsTokenAddress.Unknown);
    this.orderBeforeUpdate(orderLeafId);
    this.orderAfterUpdate(orderLeafId);
    const tx = {
      reqData: [0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n, 0n],
      tsPubKey: ['0', '0'], // Deposit tx not need signature
      sigR: [0n, 0n],
      sigS: 0n,

      r_chunks: new Array(MAX_CHUNKS_PER_REQ).fill(0n),
      o_chunks: [TsTxType.UNKNOWN],
      isCriticalChunk: [TsTxType.UNKNOWN],
      ...this.currentAccountPayload,
      ...this.currentOrderPayload,
    };
    this.addTxLogs(tx);
    return tx as unknown as TsRollupCircuitInputItemType;
  }

  private async doDeposit(req: TransactionInfo) {
    const depositL2Addr = BigInt(req.arg0);
    const reqData = [
      BigInt(TsTxType.DEPOSIT),
      BigInt(TsSystemAccountAddress.MINT_ADDR),
      BigInt(req.tokenId),
      BigInt(req.amount),
      BigInt(req.nonce),
      depositL2Addr,
      0n,
      0n,
      0n,
      0n,
    ];
    const orderLeafId = 0;
    const depositAccount = this.getAccount(depositL2Addr);
    if (!depositAccount) {
      throw new Error(`Deposit account not found L2Addr=${depositL2Addr}`);
    }
    const tokenId = req.tokenId.toString() as TsTokenAddress;

    this.accountAndTokenBeforeUpdate(depositL2Addr, tokenId);
    this.orderBeforeUpdate(orderLeafId);

    this.updateAccountToken(depositL2Addr, tokenId, req.amount, 0n);

    this.accountAndTokenAfterUpdate(depositL2Addr, tokenId);
    this.orderAfterUpdate(orderLeafId);

    // TODO: fill left reqs
    this.accountAndTokenBeforeUpdate(depositL2Addr, tokenId);
    this.accountAndTokenAfterUpdate(depositL2Addr, tokenId);
    // this.orderBeforeUpdate(orderLeafId);
    // this.orderAfterUpdate(orderLeafId);
    const { r_chunks_bigint, o_chunks_bigint, isCriticalChunk } = this.getTxChunks(req);

    const tx = {
      reqData,
      // tsPubKey: depositAccount.tsPubKey, // Deposit tx not need signature
      sigR: ['0', '0'],
      sigS: '0',

      // chunkSize * MaxTokenUnitsPerReq
      r_chunks: r_chunks_bigint,
      // TODO: handle reach o_chunks max length
      o_chunks: o_chunks_bigint,
      isCriticalChunk,
      ...this.currentAccountPayload,
      ...this.currentOrderPayload,
    };

    this.addTxLogs(tx);
    return tx as unknown as TsRollupCircuitInputItemType;
  }

  private async doRegister(req: TransactionInfo): Promise<TsRollupCircuitInputItemType> {
    const registerL2Addr = req.arg0;
    const registerTokenId = req.tokenAddr;
    const t = {
      [req.tokenAddr as TsTokenAddress]: {
        amount: BigInt(req.amount),
        lockAmt: 0n,
      },
    };
    const tokenInfos = req.tokenAddr !== TsTokenAddress.Unknown && Number(req.amount) > 0 ? t : {};
    const accountInfo = await this.accountInfoRepository.findOneOrFail({
      where: {
        accountId: registerL2Addr.toString(),
      }
    });
    const hashedTsPubKey = accountInfo.hashedTsPubKey;
    const registerAccount = this.accountLeafNodeRepository.create();
    registerAccount.leafId = registerL2Addr.toString();
    registerAccount.tsAddr = hashedTsPubKey;
    // const registerAccount = new TsRollupAccount(tokenInfos, this.config.token_tree_height, [BigInt(req.tsPubKeyX), BigInt(req.tsPubKeyY)]);
    const orderLeafId = 0;
    const reqData = [
      BigInt(TsTxType.REGISTER),
      BigInt(TsSystemAccountAddress.MINT_ADDR),
      BigInt(req.tokenId),
      BigInt(req.amount),
      BigInt(0),
      registerL2Addr,
      hashedTsPubKey,
      0n,
      0n,
      0n,
    ];
    this.accountAndTokenBeforeUpdate(registerL2Addr, registerTokenId);
    this.orderBeforeUpdate(orderLeafId);

    /** update state */
    this.addAccount(registerL2Addr, {
      l2Addr: registerL2Addr,
      tsAddr: hashedTsPubKey,
    });

    this.accountAndTokenAfterUpdate(registerL2Addr, registerTokenId);
    this.orderAfterUpdate(orderLeafId);

    // TODO: fill left reqs
    this.accountAndTokenBeforeUpdate(registerL2Addr, registerTokenId);
    this.accountAndTokenAfterUpdate(registerL2Addr, registerTokenId);
    // this.orderBeforeUpdate(orderLeafId);
    // this.orderAfterUpdate(orderLeafId);

    const { r_chunks_bigint, o_chunks_bigint, isCriticalChunk } = this.getTxChunks(req);

    const tx = {
      reqData,
      tsPubKey: [accountInfo.tsPubKeyX, accountInfo.tsPubKeyY],
      sigR: ['0', '0'], // register account no need sig
      sigS: '0', // register account no need sig

      // chunkSize * MaxTokenUnitsPerReq
      r_chunks: r_chunks_bigint,
      // TODO: handle reach o_chunks max length
      o_chunks: o_chunks_bigint,
      isCriticalChunk,
      ...this.currentAccountPayload,
      ...this.currentOrderPayload,
    };

    this.addTxLogs(tx);
    return tx as unknown as TsRollupCircuitInputItemType;
  }

  private async doWithdraw(req: TransactionInfo): Promise<TsRollupCircuitInputItemType> {
    const reqData = encodeRollupWithdrawMessage(req);
    const orderLeafId = 0;
    const transferL2AddrFrom = BigInt(req.accountId);
    const from = await this.getAccount(transferL2AddrFrom);
    if (!from) {
      throw new Error(`Deposit account not found L2Addr=${from}`);
    }
    const newNonce = from.nonce + 1n;

    this.accountAndTokenBeforeUpdate(transferL2AddrFrom, req.tokenAddr);
    this.updateAccountToken(transferL2AddrFrom, req.tokenAddr, -BigInt(req.amount), 0n);
    this.updateAccountNonce(transferL2AddrFrom, newNonce);
    this.accountAndTokenAfterUpdate(transferL2AddrFrom, req.tokenAddr);

    this.accountAndTokenBeforeUpdate(transferL2AddrFrom, req.tokenAddr);
    this.accountAndTokenAfterUpdate(transferL2AddrFrom, req.tokenAddr);
    this.orderBeforeUpdate(orderLeafId);
    this.orderAfterUpdate(orderLeafId);

    const { r_chunks_bigint, o_chunks_bigint, isCriticalChunk } = this.getTxChunks(req);

    const tx = {
      reqData,
      // tsPubKey: from.tsPubKey, // Deposit tx not need signature
      sigR: req.eddsaSig.R8,
      sigS: req.eddsaSig.S,

      // chunkSize * MaxTokenUnitsPerReq
      r_chunks: r_chunks_bigint,
      // TODO: handle reach o_chunks max length
      o_chunks: o_chunks_bigint,
      isCriticalChunk,
      ...this.currentAccountPayload,
      ...this.currentOrderPayload,
    };

    this.addTxLogs(tx);
    return tx as unknown as TsRollupCircuitInputItemType;
  }

}
