import { TsWorkerName } from '@ts-sdk/constant';
import { PinoLoggerService } from '@common/logger/adapters/real/pinoLogger.service';
import { BullWorker, BullWorkerProcess } from '@anchan828/nest-bullmq';
import { Job } from 'bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { BlockInformation } from 'common/ts-typeorm/src/account/blockInformation.entity';
import { TransactionInfo } from 'common/ts-typeorm/src/account/transactionInfo.entity';
import { Repository, Connection } from 'typeorm';
import { TS_STATUS } from 'common/ts-typeorm/src/account/tsStatus.enum';
import { recursiveToString } from '@ts-sdk/domain/lib/helper';
import {
  TsRollupConfigType,
  RollupStatus,
  CircuitAccountTxPayload,
  CircuitOrderTxPayload,
} from '@ts-sdk/domain/lib/ts-rollup/ts-rollup';
import {
  encodeRollupWithdrawMessage,
  stateToCommitment,
} from '@ts-sdk/domain/lib/ts-rollup/ts-rollup-helper';
import {
  txsToRollupCircuitInput,
  encodeRChunkBuffer,
  bigint_to_chunk_array,
} from '@ts-sdk/domain/lib/ts-rollup/ts-tx-helper';
import {
  TsRollupCircuitInputType,
  TsRollupCircuitInputItemType,
} from '@ts-sdk/domain/lib/ts-types/ts-circuit-types';
import {
  TxNoop,
  CHUNK_BITS_SIZE,
  MAX_CHUNKS_PER_REQ,
  TsTxType,
  TsSystemAccountAddress,
  TsTokenAddress,
  TsTxRequestDatasType,
} from '@ts-sdk/domain/lib/ts-types/ts-types';
import assert from 'assert';
import { dpPoseidonHash } from '@ts-sdk/domain/lib/poseidon-hash-dp';
import { TsAccountTreeService } from '@common/ts-typeorm/account/tsAccountTree.service';
import { TsTokenTreeService } from '@common/ts-typeorm/account/tsTokenTree.service';
import { ObsOrderTreeService } from '@common/ts-typeorm/auctionOrder/obsOrderTree.service';
import { AccountLeafNode } from '@common/ts-typeorm/account/accountLeafNode.entity';
import { ObsOrderLeafEntity } from '@common/ts-typeorm/auctionOrder/obsOrderLeaf.entity';
import {
  getDefaultAccountLeafMessage,
  getDefaultObsOrderLeafMessage,
  getDefaultTokenLeafMessage,
} from '@common/ts-typeorm/account/helper/mkAccount.helper';
import { AccountInformation } from '@common/ts-typeorm/account/accountInformation.entity';
import { UpdateObsOrderTreeDto } from '@common/ts-typeorm/auctionOrder/dto/updateObsOrderTree.dto';
import { BLOCK_STATUS } from '@common/ts-typeorm/account/blockStatus.enum';
import { ObsOrderEntity } from '@common/ts-typeorm/auctionOrder/obsOrder.entity';
import { arrayChunkToHexString } from '@ts-sdk/domain/lib/bigint-helper';
import { utils } from 'ethers';

const DefaultRollupConfig: TsRollupConfigType = {
  order_tree_height: 10,
  l2_acc_addr_size: 8,
  token_tree_height: 4,
  nullifier_tree_height: 8,
  numOfReqs: 10,
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
      log: 'SEQUENCER.process start',
    });
    const req = await this.txRepository.findOne({
      where: {
        txId: job.data.txId,
      },
    });
    if (!req) {
      this.logger.log(`SEQUENCER.process ${job.data.txId} not found`);
      return false;
    }
    req.txStatus = TS_STATUS.PROCESSING;
    this.txRepository.save(req);
    console.log({
      log: 'SEQUENCER.doTransaction start',
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
    private readonly txRepository: Repository<TransactionInfo>,
    @InjectRepository(BlockInformation)
    private readonly blockRepository: Repository<BlockInformation>,
    @InjectRepository(AccountLeafNode)
    private readonly accountLeafNodeRepository: Repository<AccountLeafNode>,
    @InjectRepository(AccountInformation)
    private accountInfoRepository: Repository<AccountInformation>,
    @InjectRepository(ObsOrderEntity)
    private obsOrderRepository: Repository<ObsOrderEntity>,
    private readonly tsAccountTreeService: TsAccountTreeService,
    private readonly tsTokenTreeService: TsTokenTreeService,
    private readonly obsOrderTreeService: ObsOrderTreeService,
    private connection: Connection,
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
  private currentAccountPayload: CircuitAccountTxPayload =
    this.prepareTxAccountPayload();
  private currentOrderPayload: CircuitOrderTxPayload =
    this.prepareTxOrderPayload();

  private blockLogs: Map<
    string,
    {
      logs: any[];
      accountRootFlow: bigint[];
      auctionOrderRootFlow: bigint[];
    }
  > = new Map();

  /** Order */
  async getObsOrder(orderId: string): Promise<ObsOrderLeafEntity | null> {
    return await this.obsOrderTreeService.getLeaf(orderId);
  }

  /** Account */
  async getAccount(accAddr: string): Promise<AccountLeafNode | null> {
    const acc = await this.tsAccountTreeService.getLeaf(accAddr);

    if (acc.tsAddr === '0' || !acc) {
      // TODO: check account is exist
      return null;
    }
    return acc;
  }

  async addAccount(
    l2addr: bigint,
    account: {
      l2Addr: bigint;
      tsAddr: bigint;
    },
  ): Promise<bigint> {
    // TODO: check account is exist
    // TODO: check register has tokenInfo
    await this.tsAccountTreeService.addLeaf({
      leafId: l2addr.toString(),
      tsAddr: account.tsAddr.toString(),
    });
    return l2addr;
  }

  private async updateAccountToken(
    leaf_id: string,
    tokenAddr: TsTokenAddress,
    tokenAmt: bigint,
    lockedAmt: bigint,
  ) {
    const tokenInfo = await this.tsTokenTreeService.getLeaf(tokenAddr, leaf_id);

    const newAvlAmt = BigInt(tokenInfo.availableAmt) + tokenAmt;
    const newLktAmt = BigInt(tokenInfo.lockedAmt) + lockedAmt;
    await this.tsAccountTreeService.updateTokenLeaf(leaf_id, {
      availableAmt: newAvlAmt.toString(),
      lockedAmt: newLktAmt.toString(),
      leafId: tokenAddr,
      accountId: leaf_id,
    });
  }
  private async updateAccountNonce(leaf_id: string, nonce: bigint) {
    const acc = await this.getAccount(leaf_id);
    if (!acc) {
      throw new Error(`updateAccountNonce: account id=${leaf_id} not found`);
    }
    await this.tsAccountTreeService.updateLeaf(leaf_id, {
      leafId: leaf_id,
      nonce: nonce.toString(),
    });
  }

  /** Rollup trace */
  private async addFirstRootFlow() {
    if (
      this.currentAccountRootFlow.length !== 0 ||
      this.currentOrderRootFlow.length !== 0
    ) {
      throw new Error('addFirstRootFlow must run on new block');
    }
    await this.addAccountRootFlow();
    await this.addOrderRootFlow();
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
    return {
      logs,
      accountRootFlow,
      auctionOrderRootFlow,
    };
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
    const r = await this.blockRepository.insert({
      blockHash: '',
      L1TransactionHash: '',
      verifiedAt: new Date(0),
      blockStatus: BLOCK_STATUS.PROCESSING,
      operatorAddress: '',
    });
    const newBlock = r.identifiers[0];
    this.newBlockNumber = BigInt(newBlock.blockNumber || 0);
    this.addFirstRootFlow();
    return {
      blockNumber: this.newBlockNumber,
    };
  }

  async endRollup(): Promise<{
    inputs: TsRollupCircuitInputType;
  }> {
    this.logger.log(`endRollup: blockNumber=${this.newBlockNumber}`);
    return await this.connection.transaction(async (manager) => {
      const currentBlockNumber = this.newBlockNumber;
      const currentBlcok = await manager.findOneByOrFail(BlockInformation, {
        blockNumber: Number(currentBlockNumber),
      });

      const perBatch = this.txNormalPerBatch;

      if (this.currentTxLogs.length !== perBatch) {
        console.log(
          `Rollup txNumbers=${this.currentTxLogs.length} not match txPerBatch=${perBatch}`,
        );
        const emptyTxNum = perBatch - this.currentTxLogs.length;
        for (let i = 0; i < emptyTxNum; i++) {
          await this.doTransaction(TxNoop);
        }
      }
      this.rollupStatus = RollupStatus.Idle;
      const circuitInputs = txsToRollupCircuitInput(this.currentTxLogs) as any;
      // TODO: type check

      const publicDataOffsets = [];
      const o_chunk_1level_length = circuitInputs['o_chunks'].length;
      let currentOffset = 0;
      for (let index = 0; index < o_chunk_1level_length; index++) {
        publicDataOffsets.push(currentOffset);
        const reqChunkLength = circuitInputs['o_chunks'][index].length;
        currentOffset += reqChunkLength;
      }

      circuitInputs['o_chunks'] = circuitInputs['o_chunks'].flat();

      const o_chunk_remains =
        this.config.numOfChunks - circuitInputs['o_chunks'].length;
      circuitInputs['isCriticalChunk'] =
        circuitInputs['isCriticalChunk'].flat();
      const l1RequestNum = circuitInputs['o_chunks'].filter(
        (t: any) => t === '1',
      ).length;
      // assert(
      //   circuitInputs['isCriticalChunk'].length === circuitInputs['o_chunks'].length,
      //   `isCriticalChunk=${circuitInputs['isCriticalChunk'].length} length not match o_chunks=${circuitInputs['o_chunks'].length} `,
      // );
      // for (let index = 0; index < o_chunk_remains; index++) {
      //   circuitInputs['o_chunks'].push('0');
      //   circuitInputs['isCriticalChunk'].push('0');
      // }
      // assert(
      //   circuitInputs['o_chunks'].length === this.config.numOfChunks,
      //   `o_chunks=${circuitInputs['o_chunks'].length} length not match numOfChunks=${this.config.numOfChunks} `,
      // );
      // assert(
      //   circuitInputs['isCriticalChunk'].length === this.config.numOfChunks,
      //   `isCriticalChunk=${circuitInputs['isCriticalChunk'].length} length not match numOfChunks=${this.config.numOfChunks} `,
      // );
      // TODO: hotfix
      circuitInputs['r_accountLeafId'] = circuitInputs['r_accountLeafId'][0];
      circuitInputs['r_oriAccountLeaf'] = circuitInputs['r_oriAccountLeaf'][0];
      circuitInputs['r_newAccountLeaf'] = circuitInputs['r_newAccountLeaf'][0];
      circuitInputs['r_accountRootFlow'] =
        circuitInputs['r_accountRootFlow'][0];
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
      circuitInputs['accountRootFlow'] = this.currentAccountRootFlow.map((x) =>
        recursiveToString(x),
      );
      circuitInputs['orderRootFlow'] = this.currentOrderRootFlow.map((x) =>
        recursiveToString(x),
      );
      this.oriTxId = this.latestTxId;
      this.flushBlock(currentBlockNumber);

      currentBlcok.blockStatus = BLOCK_STATUS.L2EXECUTED;
      currentBlcok.rawData = JSON.stringify(circuitInputs);

      const stateRoot = await this.stateRoot();
      const orderTreeRoot = await this.obsOrderTreeService.getRoot();
      const oriTxNum = this.oriTxId;
      const tsRoot =
        '0x' +
        dpPoseidonHash([BigInt(orderTreeRoot.hash), oriTxNum])
          .toString(16)
          .padStart(64, '0');
      const accountRoot = (await this.tsAccountTreeService.getRoot()).hash;
      const orderRoot = (await this.obsOrderTreeService.getRoot()).hash;
      const state_isCriticalChunk = arrayChunkToHexString(
        circuitInputs?.isCriticalChunk as any,
        1,
      );
      const state_o_chunk = arrayChunkToHexString(
        circuitInputs?.o_chunks as any,
      );
      const pubdata = utils.solidityPack(
        ['bytes', 'bytes'],
        [state_isCriticalChunk, state_o_chunk],
      );
      const { commitmentMessage, commitment } = stateToCommitment({
        oriStateRoot: stateRoot,
        newStateRoot: stateRoot,
        newTsRoot: tsRoot,
        pubdata,
      });
      currentBlcok.state = {
        blockNumber: currentBlockNumber.toString(),
        stateRoot,
        l1RequestNum,
        commitment,
        tsRoot: tsRoot,
        publicData: commitmentMessage,
        publicDataOffsets: publicDataOffsets.map((v) => v.toString()),
        orderRoot,
        accountRoot,
        timestamp: '0',
        pendingRollupTxHash: '',
      };
      console.log({
        blockState: currentBlcok.state,
      });
      await manager.save(currentBlcok);
      return {
        inputs: circuitInputs,
      };
    });
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

  private async tokenBeforeUpdate(
    accountLeafId: string,
    tokenAddr: TsTokenAddress,
  ) {
    const account = await this.getAccount(accountLeafId);
    if (
      this.currentAccountPayload.r_tokenLeafId[
        this.currentAccountPayload.r_tokenLeafId.length - 1
      ]?.length === 1
    ) {
      this.currentAccountPayload.r_tokenLeafId[
        this.currentAccountPayload.r_tokenLeafId.length - 1
      ].push(tokenAddr);
    } else {
      this.currentAccountPayload.r_tokenLeafId.push([tokenAddr]);
    }
    if (!account) {
      const mkp = await this.tsTokenTreeService.getMerklerProofByAccountId(
        '0',
        '0',
      );
      this.currentAccountPayload.r_tokenRootFlow.push([
        this.tsTokenTreeService.getDefaultRoot(),
      ]);
      this.currentAccountPayload.r_oriTokenLeaf.push(
        getDefaultTokenLeafMessage(),
      );
      this.currentAccountPayload.r_tokenMkPrf.push(mkp);
    } else {
      const tokenInfo = await this.tsTokenTreeService.getLeaf(
        tokenAddr,
        accountLeafId.toString(),
      );
      const tokenRoot = await this.tsTokenTreeService.getRoot(
        accountLeafId.toString(),
      );
      const mkPrf = await this.tsTokenTreeService.getMerklerProofByAccountId(
        tokenAddr,
        accountLeafId.toString(),
      );
      this.currentAccountPayload.r_tokenRootFlow.push([tokenRoot.hash]);
      this.currentAccountPayload.r_oriTokenLeaf.push(tokenInfo.encode());
      this.currentAccountPayload.r_tokenMkPrf.push(mkPrf);
    }
  }
  private async tokenAfterUpdate(
    accountLeafId: string,
    tokenAddr: TsTokenAddress,
  ) {
    const account = await this.getAccount(accountLeafId);
    if (!account) {
      throw new Error('accountAfterUpdate: account not found');
    }
    const tokenInfo = await this.tsTokenTreeService.getLeaf(
      tokenAddr,
      accountLeafId.toString(),
    );
    const tokenRoot = await this.tsTokenTreeService.getRoot(
      accountLeafId.toString(),
    );

    const idx = this.currentAccountPayload.r_tokenRootFlow.length - 1;
    this.currentAccountPayload.r_newTokenLeaf.push(tokenInfo.encode());
    this.currentAccountPayload.r_tokenRootFlow[idx].push(tokenRoot.hash);
  }
  private async accountBeforeUpdate(accountLeafId: string) {
    const account = await this.getAccount(accountLeafId);
    if (
      this.currentAccountPayload.r_accountLeafId[
        this.currentAccountPayload.r_accountLeafId.length - 1
      ]?.length === 1
    ) {
      this.currentAccountPayload.r_accountLeafId[
        this.currentAccountPayload.r_accountLeafId.length - 1
      ].push(accountLeafId);
    } else {
      this.currentAccountPayload.r_accountLeafId.push([accountLeafId]);
    }
    if (!account) {
      const mkp = await this.tsAccountTreeService.getMerklerProof('0');
      const root = await this.tsAccountTreeService.getRoot();
      const tokenRoot = await this.tsTokenTreeService.getRoot(
        accountLeafId.toString(),
      );
      const leaf = getDefaultAccountLeafMessage(tokenRoot.hash);
      this.currentAccountPayload.r_oriAccountLeaf.push(leaf);
      this.currentAccountPayload.r_accountRootFlow.push([root.hash]);
      this.currentAccountPayload.r_accountMkPrf.push(mkp);
    } else {
      const mkp = await this.tsAccountTreeService.getMerklerProof(
        accountLeafId,
      );
      const leaf = await this.tsAccountTreeService.getLeaf(accountLeafId);
      const root = await this.tsAccountTreeService.getRoot();
      this.currentAccountPayload.r_oriAccountLeaf.push(leaf.encode());
      this.currentAccountPayload.r_accountRootFlow.push([root]);
      this.currentAccountPayload.r_accountMkPrf.push(mkp);
    }
  }
  private async accountAfterUpdate(accountLeafId: string) {
    const account = await this.getAccount(accountLeafId);
    if (!account) {
      throw new Error('accountAfterUpdate: account not found');
    }
    const idx = this.currentAccountPayload.r_accountRootFlow.length - 1;
    const root = await this.tsAccountTreeService.getRoot();
    this.currentAccountPayload.r_newAccountLeaf.push(account.encode());
    this.currentAccountPayload.r_accountRootFlow[idx].push(root);
  }

  private async accountAndTokenBeforeUpdate(
    accountLeafId: string,
    tokenAddr: TsTokenAddress,
  ) {
    const account = await this.getAccount(accountLeafId);
    if (
      this.currentAccountPayload.r_accountLeafId[
        this.currentAccountPayload.r_accountLeafId.length - 1
      ]?.length === 1
    ) {
      this.currentAccountPayload.r_accountLeafId[
        this.currentAccountPayload.r_accountLeafId.length - 1
      ].push(accountLeafId);
    } else {
      this.currentAccountPayload.r_accountLeafId.push([accountLeafId]);
    }
    if (
      this.currentAccountPayload.r_tokenLeafId[
        this.currentAccountPayload.r_tokenLeafId.length - 1
      ]?.length === 1
    ) {
      this.currentAccountPayload.r_tokenLeafId[
        this.currentAccountPayload.r_tokenLeafId.length - 1
      ].push(tokenAddr);
    } else {
      this.currentAccountPayload.r_tokenLeafId.push([tokenAddr]);
    }
    const root = await this.tsAccountTreeService.getRoot();
    this.currentAccountPayload.r_accountRootFlow.push([root]);
    if (!account) {
      const tokenRoot = await this.tsTokenTreeService.getRoot(
        accountLeafId.toString(),
      );
      const leaf = getDefaultAccountLeafMessage(tokenRoot.hash);
      const AccountMkp = await this.tsAccountTreeService.getMerklerProof('0');
      const tokenMkp = await this.tsTokenTreeService.getMerklerProofByAccountId(
        '0',
        '0',
      );

      this.currentAccountPayload.r_oriAccountLeaf.push(leaf);
      this.currentAccountPayload.r_accountMkPrf.push(AccountMkp);
      this.currentAccountPayload.r_tokenRootFlow.push([
        this.tsTokenTreeService.getDefaultRoot(),
      ]);
      this.currentAccountPayload.r_oriTokenLeaf.push(
        getDefaultTokenLeafMessage(),
      );
      this.currentAccountPayload.r_tokenMkPrf.push(tokenMkp);
    } else {
      const accountMkp = await this.tsAccountTreeService.getMerklerProof(
        accountLeafId,
      );
      const accountLeaf = await this.tsAccountTreeService.getLeaf(
        accountLeafId,
      );
      const tokenInfo = await this.tsTokenTreeService.getLeaf(
        tokenAddr,
        accountLeafId.toString(),
      );
      const tokenRoot = await this.tsTokenTreeService.getRoot(
        accountLeafId.toString(),
      );
      const tokenMkPr =
        await this.tsTokenTreeService.getMerklerProofByAccountId(
          tokenAddr,
          accountLeafId.toString(),
        );

      this.currentAccountPayload.r_oriAccountLeaf.push(accountLeaf.encode());
      this.currentAccountPayload.r_accountMkPrf.push(accountMkp);
      this.currentAccountPayload.r_tokenRootFlow.push([tokenRoot.hash]);
      this.currentAccountPayload.r_oriTokenLeaf.push(tokenInfo.encode());
      this.currentAccountPayload.r_tokenMkPrf.push(tokenMkPr);
    }
  }

  private async accountAndTokenAfterUpdate(
    accountLeafId: string,
    tokenAddr: TsTokenAddress,
  ) {
    // const account = await this.getAccount(accountLeafId);
    // if (!account) {
    //   throw new Error('accountAfterUpdate: account not found');
    // }
    const tokenInfo = await this.tsTokenTreeService.getLeaf(
      tokenAddr,
      accountLeafId.toString(),
    );
    const tokenRoot = await this.tsTokenTreeService.getRoot(
      accountLeafId.toString(),
    );
    const accountRoot = await this.tsAccountTreeService.getRoot();
    const accountLeaf = await this.tsAccountTreeService.getLeaf(accountLeafId);
    const idx = this.currentAccountPayload.r_accountRootFlow.length - 1;
    this.currentAccountPayload.r_newAccountLeaf.push(accountLeaf.encode());
    this.currentAccountPayload.r_accountRootFlow[idx].push(accountRoot);
    this.currentAccountPayload.r_newTokenLeaf.push(tokenInfo.encode());

    this.currentAccountPayload.r_tokenRootFlow[idx].push(tokenRoot.hash);
  }

  private async orderBeforeUpdate(orderLeafId: string) {
    const order = await this.getObsOrder(orderLeafId);
    this.currentOrderPayload.r_orderLeafId.push([orderLeafId.toString()]);

    const root = await this.obsOrderTreeService.getRoot();
    const orderMkp = await this.obsOrderTreeService.getMerklerProof(
      orderLeafId,
    );
    if (order) {
      this.currentOrderPayload.r_oriOrderLeaf.push(order.encode());
      this.currentOrderPayload.r_orderRootFlow.push([root.hash]);
      this.currentOrderPayload.r_orderMkPrf.push(orderMkp);
    } else {
      const defaultOrderLeafMessage = getDefaultObsOrderLeafMessage();
      this.currentOrderPayload.r_oriOrderLeaf.push(defaultOrderLeafMessage);
      this.currentOrderPayload.r_orderRootFlow.push([root.hash]);
      this.currentOrderPayload.r_orderMkPrf.push(orderMkp);
    }
  }

  private async orderAfterUpdate(orderLeafId: string) {
    const order = await this.getObsOrder(orderLeafId);
    const root = await this.obsOrderTreeService.getRoot();

    this.currentOrderPayload.r_orderRootFlow[
      this.currentOrderPayload.r_orderRootFlow.length - 1
    ].push(root.hash);
    if (order) {
      this.currentOrderPayload.r_newOrderLeaf.push(order.encode());
      // this.currentOrderPayload.r_orderMkPrf.push(this.mkOrderTree.getProof(orderLeafId));
    } else {
      const defaultOrderLeafMessage = getDefaultObsOrderLeafMessage();
      this.currentOrderPayload.r_newOrderLeaf.push(defaultOrderLeafMessage);
    }
  }

  private async addObsOrder(order: UpdateObsOrderTreeDto) {
    // if (BigInt(order.orderLeafId) > 0n) {
    //   throw new Error('addObsOrder: orderLeafId should be 0');
    // }
    // order.orderLeafId = this.obsOrderTreeService.currentOrderId.toString();
    this.obsOrderRepository.update(
      {
        txId: Number(order.txId),
      },
      {
        orderLeafId: Number(order.orderLeafId),
      },
    );
    this.obsOrderTreeService.updateLeaf(order.orderLeafId, order);
    this.obsOrderTreeService.addCurrentOrderId();
  }
  private async removeObsOrder(leafId: string) {
    const order = await this.getObsOrder(leafId);
    if (!order) {
      throw new Error('removeObsOrder: order not found');
    }
    if (order.reqType === TsTxType.UNKNOWN) {
      throw new Error('removeObsOrder: order not found (0)');
    }
    await this.obsOrderTreeService.updateLeaf(order.orderLeafId, {
      orderLeafId: order.orderLeafId,
      txId: '0',
      reqType: '0',
      sender: '0',
      sellTokenId: '0',
      nonce: '0',
      sellAmt: '0',
      buyTokenId: '0',
      buyAmt: '0',
      accumulatedSellAmt: '0',
      accumulatedBuyAmt: '0',
    });
  }
  private async updateObsOrder(order: UpdateObsOrderTreeDto) {
    // assert(BigInt(order.orderLeafId) > 0n, 'updateObsOrder: orderLeafId should be exist');
    await this.obsOrderTreeService.updateLeaf(order.orderLeafId, order);
  }

  private getTxChunks(
    txEntity: TransactionInfo,
    metadata?: {
      txOffset: bigint;
      makerBuyAmt: bigint;
    },
  ) {
    const { r_chunks, o_chunks, isCritical } = encodeRChunkBuffer(
      txEntity,
      metadata,
    );

    // TODO multiple txs need handle o_chunks in end of block;
    const r_chunks_bigint = bigint_to_chunk_array(
      BigInt('0x' + r_chunks.toString('hex')),
      BigInt(CHUNK_BITS_SIZE),
    );
    const o_chunks_bigint = bigint_to_chunk_array(
      BigInt('0x' + o_chunks.toString('hex')),
      BigInt(CHUNK_BITS_SIZE),
    );
    const isCriticalChunk = o_chunks_bigint.map((_) => '0');
    if (isCritical) {
      isCriticalChunk[0] = '1';
    }

    return { r_chunks_bigint, o_chunks_bigint, isCriticalChunk };
  }

  async getTsPubKey(accountId: string) {
    const tsPubKey = await this.accountInfoRepository.findOneOrFail({
      select: ['tsPubKeyX', 'tsPubKeyY'],
      where: {
        accountId: accountId,
      },
    });
    return [tsPubKey.tsPubKeyX, tsPubKey.tsPubKeyY];
  }

  async doTransaction(
    req: TransactionInfo,
  ): Promise<TsRollupCircuitInputItemType> {
    try {
      console.time(`doTransaction txid=${req.txId}, reqType=${req.reqType}`);
      console.log({
        req,
        accountId: req.accountId,
        tpye: typeof req.accountId,
      });
      if (this.rollupStatus !== RollupStatus.Running) {
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
        case TsTxType.SecondLimitOrder:
          inputs = await this.doSecondLimitOrder(req);
          break;
        case TsTxType.SecondLimitStart:
          inputs = await this.doSecondLimitStart(req);
          break;
        case TsTxType.SecondLimitExchange:
          inputs = await this.doSecondLimitExchange(req);
          break;
        case TsTxType.SecondLimitEnd:
          inputs = await this.doSecondLimitEnd(req);
          break;
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

      await this.addAccountRootFlow();
      await this.addOrderRootFlow();

      const remains = this.txNormalPerBatch - this.currentTxLogs.length;
      if (remains < 3) {
        await this.endRollup();
      }
      console.timeEnd(`doTransaction txid=${req.txId}, reqType=${req.reqType}`);
      return inputs;
    } catch (error: any) {
      console.error('-----------------------');
      console.error(error);
      console.error('-----------------------');
      // return {error: true} as unknown as TsRollupCircuitInputItemType;
      throw error;
    }
  }

  private async doSecondLimitOrder(
    req: TransactionInfo,
  ): Promise<TsRollupCircuitInputItemType> {
    const accountLeafId = req.accountId;
    const reqData: TsTxRequestDatasType = [
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
    const from = await this.getAccount(accountLeafId);
    if (!from) {
      throw new Error(`account not found L2Addr=${from}`);
    }
    const newNonce = BigInt(from.nonce) + 1n;
    const tokenAddr = req.tokenAddr;

    await this.accountAndTokenBeforeUpdate(accountLeafId, tokenAddr);
    await this.updateAccountToken(
      accountLeafId,
      tokenAddr,
      -BigInt(req.amount),
      BigInt(req.amount),
    );
    await this.updateAccountNonce(accountLeafId, newNonce);
    await this.accountAndTokenAfterUpdate(accountLeafId, tokenAddr);

    await this.accountAndTokenBeforeUpdate(accountLeafId, tokenAddr);
    await this.accountAndTokenAfterUpdate(accountLeafId, tokenAddr);

    const orderLeafId = this.obsOrderTreeService.currentOrderId.toString();
    const txId = this.latestTxId;

    const order: UpdateObsOrderTreeDto = {
      orderLeafId,
      txId: txId.toString(),
      reqType: req.reqType.toString(),
      sender: accountLeafId,
      sellTokenId: req.tokenAddr,
      sellAmt: req.amount,
      nonce: req.nonce,
      buyTokenId: req.arg2,
      buyAmt: req.arg3,
      accumulatedSellAmt: '0',
      accumulatedBuyAmt: '0',
    };
    console.log({
      doSecondLimitOrder: order,
    });
    await this.orderBeforeUpdate(orderLeafId);
    await this.addObsOrder(order);
    // await this.addAuctionOrder(req.reqType, txId, req as unknown as TsTxAuctionLendRequest | TsTxAuctionBorrowRequest);
    await this.orderAfterUpdate(orderLeafId);

    const { r_chunks_bigint, o_chunks_bigint, isCriticalChunk } =
      this.getTxChunks(req);
    const tsPubKey = await this.getTsPubKey(accountLeafId);
    const tx = {
      reqData,
      tsPubKey, // Deposit tx not need signature
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

  private currentHoldTakerOrder: ObsOrderLeafEntity | null = null;
  async doSecondLimitStart(req: TransactionInfo) {
    const reqData: TsTxRequestDatasType = [
      BigInt(TsTxType.SecondLimitStart),
      0n,
      0n,
      0n,
      0n,
      0n,
      0n,
      0n,
      0n,
      BigInt(req.arg4),
    ];
    const orderLeafId = req.arg4;
    const order = await this.getObsOrder(orderLeafId);
    if (!order) {
      throw new Error(
        `doCancelOrder: order not found orderLeafId=${orderLeafId}`,
      );
    }
    if (order.sender === '0') {
      throw new Error(
        `doCancelOrder: order not found orderLeafId=${orderLeafId} (order.sender=0)`,
      );
    }
    this.currentHoldTakerOrder = order;
    const from = await this.getAccount(order.sender);
    if (!from) {
      throw new Error(`account not found L2Addr=${from}`);
    }
    const sellTokenId = order.sellTokenId.toString() as TsTokenAddress;

    await this.accountAndTokenBeforeUpdate(order.sender, sellTokenId);
    await this.accountAndTokenAfterUpdate(order.sender, sellTokenId);
    await this.accountAndTokenBeforeUpdate(order.sender, sellTokenId);
    await this.accountAndTokenAfterUpdate(order.sender, sellTokenId);

    await this.orderBeforeUpdate(orderLeafId);
    await this.removeObsOrder(orderLeafId);
    await this.orderAfterUpdate(orderLeafId);

    const txId = this.latestTxId;
    const orderTxId = BigInt(order.txId?.toString() || '0');
    const { r_chunks_bigint, o_chunks_bigint, isCriticalChunk } =
      this.getTxChunks(req, {
        txOffset: txId - orderTxId,
        makerBuyAmt: 0n,
      });

    const tsPubKey = await this.getTsPubKey(req.accountId);
    const tx = {
      reqData,
      tsPubKey, // Deposit tx not need signature
      sigR: ['0', '0'],
      sigS: '0',

      r_chunks: r_chunks_bigint,
      o_chunks: o_chunks_bigint,
      isCriticalChunk,
      ...this.currentAccountPayload,
      ...this.currentOrderPayload,
    };

    this.addTxLogs(tx);
    return tx as unknown as TsRollupCircuitInputItemType;
  }
  async doSecondLimitExchange(req: TransactionInfo) {
    const reqData: TsTxRequestDatasType = [
      BigInt(TsTxType.SecondLimitExchange),
      0n,
      0n,
      0n,
      0n,
      0n,
      0n,
      0n,
      0n,
      BigInt(req.arg4),
    ];
    const orderLeafId = req.arg4;
    const makerOrder = await this.getObsOrder(req.arg4);
    if (!makerOrder) {
      throw new Error(
        `doCancelOrder: order not found orderLeafId=${orderLeafId}`,
      );
    }
    if (makerOrder.sender === '0') {
      throw new Error(
        `doCancelOrder: order not found orderLeafId=${orderLeafId} (order.sender=0)`,
      );
    }
    const makerAcc = await this.getAccount(makerOrder.sender);
    if (!makerAcc) {
      throw new Error(`account not found L2Addr=${makerOrder.sender}`);
    }
    const sellTokenId = makerOrder.sellTokenId.toString() as TsTokenAddress;
    const buyTokenId = makerOrder.buyTokenId.toString() as TsTokenAddress;
    const accumulatedBuyAmt = BigInt(req.accumulatedBuyAmt);
    const accumulatedSellAmt = BigInt(req.accumulatedSellAmt);

    await this.accountBeforeUpdate(makerOrder.sender);

    await this.tokenBeforeUpdate(makerOrder.sender, buyTokenId);
    await this.updateAccountToken(
      makerAcc.leafId,
      buyTokenId,
      accumulatedBuyAmt,
      0n,
    );
    await this.tokenAfterUpdate(makerOrder.sender, buyTokenId);

    await this.tokenBeforeUpdate(makerOrder.sender, sellTokenId);
    await this.updateAccountToken(
      makerAcc.leafId,
      sellTokenId,
      0n,
      -accumulatedSellAmt,
    );
    await this.tokenAfterUpdate(makerOrder.sender, sellTokenId);

    await this.accountAfterUpdate(makerOrder.sender);

    await this.accountBeforeUpdate(makerOrder.sender);
    await this.accountAfterUpdate(makerOrder.sender);

    await this.orderBeforeUpdate(orderLeafId);
    makerOrder.accumulatedSellAmt = (
      BigInt(makerOrder.accumulatedSellAmt) + accumulatedSellAmt
    ).toString();
    makerOrder.accumulatedBuyAmt = (
      BigInt(makerOrder.accumulatedBuyAmt) + accumulatedBuyAmt
    ).toString();
    const isAllSellAmtMatched =
      makerOrder.accumulatedSellAmt === makerOrder.sellAmt;
    if (isAllSellAmtMatched) {
      await this.removeObsOrder(orderLeafId);
    } else {
      await this.updateObsOrder(makerOrder.convertToObsOrderDto());
    }
    await this.orderAfterUpdate(orderLeafId);

    const txId = this.latestTxId;
    const orderTxId = BigInt(makerOrder.txId?.toString() || '0');
    const { r_chunks_bigint, o_chunks_bigint, isCriticalChunk } =
      this.getTxChunks(req, {
        txOffset: txId - orderTxId,
        makerBuyAmt: BigInt(makerOrder.buyAmt),
      });
    const tsPubKey = await this.getTsPubKey(makerAcc.leafId);
    const tx = {
      reqData,
      tsPubKey, // Deposit tx not need signature
      sigR: ['0', '0'],
      sigS: '0',

      r_chunks: r_chunks_bigint,
      o_chunks: o_chunks_bigint,
      isCriticalChunk,
      ...this.currentAccountPayload,
      ...this.currentOrderPayload,
    };

    this.addTxLogs(tx);
    return tx as unknown as TsRollupCircuitInputItemType;
  }
  async doSecondLimitEnd(req: TransactionInfo) {
    // assert(!!this.currentHoldTakerOrder, 'doSecondLimitEnd: currentHoldTakerOrder is null');
    const reqData: TsTxRequestDatasType = [
      BigInt(TsTxType.SecondLimitEnd),
      0n,
      0n,
      0n,
      0n,
      0n,
      0n,
      0n,
      0n,
      BigInt(req.arg4),
    ];
    const orderLeafId = req.arg4;
    // assert(orderLeafId === this.currentHoldTakerOrder.orderLeafId, 'doSecondLimitEnd: orderLeafId not match');
    const takerOrder = this.currentHoldTakerOrder;
    if (!takerOrder) {
      throw new Error(
        `doSecondLimitEnd: order not found orderLeafId=${orderLeafId}`,
      );
    }
    if (takerOrder.sender === '0') {
      throw new Error(
        `doSecondLimitEnd: order not found orderLeafId=${orderLeafId} (order.sender=0)`,
      );
    }
    const takerAcc = await this.getAccount(takerOrder.sender);
    if (!takerAcc) {
      throw new Error(`account not found L2Addr=${takerOrder.sender}`);
    }
    const sellTokenId = takerOrder.sellTokenId.toString() as TsTokenAddress;
    const buyTokenId = takerOrder.buyTokenId.toString() as TsTokenAddress;
    const accumulatedBuyAmt = BigInt(req.accumulatedBuyAmt);
    const accumulatedSellAmt = BigInt(req.accumulatedSellAmt);

    await this.accountBeforeUpdate(takerOrder.sender);

    await this.tokenBeforeUpdate(takerOrder.sender, buyTokenId);
    await this.updateAccountToken(
      takerAcc.leafId,
      buyTokenId,
      accumulatedBuyAmt,
      0n,
    );
    await this.tokenAfterUpdate(takerOrder.sender, buyTokenId);

    await this.tokenBeforeUpdate(takerOrder.sender, sellTokenId);
    await this.updateAccountToken(
      takerAcc.leafId,
      sellTokenId,
      0n,
      -accumulatedSellAmt,
    );
    await this.tokenAfterUpdate(takerOrder.sender, sellTokenId);

    await this.accountAfterUpdate(takerOrder.sender);

    await this.accountBeforeUpdate(takerOrder.sender);
    await this.accountAfterUpdate(takerOrder.sender);

    await this.orderBeforeUpdate(orderLeafId);
    takerOrder.accumulatedSellAmt = (
      BigInt(takerOrder.accumulatedSellAmt) + accumulatedSellAmt
    ).toString();
    takerOrder.accumulatedBuyAmt = (
      BigInt(takerOrder.accumulatedBuyAmt) + accumulatedBuyAmt
    ).toString();
    const isAllSellAmtMatched =
      takerOrder.accumulatedSellAmt === takerOrder.sellAmt;
    if (isAllSellAmtMatched) {
      this.removeObsOrder(orderLeafId);
    } else {
      this.updateObsOrder(takerOrder.convertToObsOrderDto());
    }
    await this.orderAfterUpdate(orderLeafId);

    const txId = this.latestTxId;
    const orderTxId = BigInt(takerOrder.txId?.toString() || '0');
    const { r_chunks_bigint, o_chunks_bigint, isCriticalChunk } =
      this.getTxChunks(req, {
        txOffset: txId - orderTxId,
        makerBuyAmt: 0n,
      });

    this.currentHoldTakerOrder = null;
    const tsPubKey = await this.getTsPubKey(takerAcc.leafId);

    const tx = {
      reqData,
      tsPubKey, // Deposit tx not need signature
      sigR: ['0', '0'],
      sigS: '0',

      r_chunks: r_chunks_bigint,
      o_chunks: o_chunks_bigint,
      isCriticalChunk,
      ...this.currentAccountPayload,
      ...this.currentOrderPayload,
    };

    this.addTxLogs(tx);
    return tx as unknown as TsRollupCircuitInputItemType;
  }

  async doCancelOrder(req: TransactionInfo) {
    const orderLeafId = req.arg4;
    const reqData: TsTxRequestDatasType = [
      BigInt(TsTxType.CancelOrder),
      0n,
      0n,
      0n,
      0n,
      BigInt(req.arg0),
      BigInt(orderLeafId),
      0n,
      0n,
      0n,
    ];
    const order = await this.getObsOrder(orderLeafId);
    if (!order) {
      throw new Error(
        `doCancelOrder: order not found orderLeafId=${orderLeafId}`,
      );
    }
    if (order.sender === '0') {
      throw new Error(
        `doCancelOrder: order not found orderLeafId=${orderLeafId} (order.sender=0)`,
      );
    }
    const account = await this.getAccount(order.sender);
    if (!account) {
      throw new Error(
        `doCancelOrder: account not found L2Addr=${order.sender}`,
      );
    }
    if (req.arg0 !== account.leafId) {
      throw new Error(
        `doCancelOrder: account not match L2Addr=${order.sender} req.arg0=${req.arg0}`,
      );
    }
    const refundTokenAddr = order.sellTokenId.toString() as TsTokenAddress;
    const refundAmount =
      BigInt(order.sellAmt) - BigInt(order.accumulatedSellAmt);

    await this.accountAndTokenBeforeUpdate(account.leafId, refundTokenAddr);
    await this.updateAccountToken(
      account.leafId,
      refundTokenAddr,
      BigInt(refundAmount),
      -BigInt(refundAmount),
    );
    await this.accountAndTokenAfterUpdate(account.leafId, refundTokenAddr);
    await this.accountAndTokenBeforeUpdate(account.leafId, refundTokenAddr);
    await this.accountAndTokenAfterUpdate(account.leafId, refundTokenAddr);

    await this.orderBeforeUpdate(order.orderLeafId);
    await this.removeObsOrder(order.orderLeafId);
    await this.orderAfterUpdate(order.orderLeafId);

    const { r_chunks_bigint, o_chunks_bigint, isCriticalChunk } =
      this.getTxChunks(req);
    const tsPubKey = await this.getTsPubKey(account.leafId);
    const tx = {
      reqData,
      tsPubKey, // Deposit tx not need signature
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

  private async doNoop() {
    const orderLeafId = '0';
    // const account = await this.getAccount('0');
    // if (!account) {
    //   throw new Error('doNoop: account not found');
    // }
    await this.accountAndTokenBeforeUpdate('0', TsTokenAddress.Unknown);
    await this.accountAndTokenAfterUpdate('0', TsTokenAddress.Unknown);
    await this.accountAndTokenBeforeUpdate('0', TsTokenAddress.Unknown);
    await this.accountAndTokenAfterUpdate('0', TsTokenAddress.Unknown);
    await this.orderBeforeUpdate(orderLeafId);
    await this.orderAfterUpdate(orderLeafId);
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
    const accountLeafId = req.arg0;
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
    const orderLeafId = '0';
    const depositAccount = await this.getAccount(accountLeafId);
    if (!depositAccount) {
      throw new Error(`Deposit account not found L2Addr=${accountLeafId}`);
    }
    const tokenId = req.tokenId.toString() as TsTokenAddress;

    await this.accountAndTokenBeforeUpdate(accountLeafId, tokenId);
    await this.orderBeforeUpdate(orderLeafId);

    await this.updateAccountToken(
      accountLeafId,
      tokenId,
      BigInt(req.amount),
      0n,
    );

    await this.accountAndTokenAfterUpdate(accountLeafId, tokenId);
    await this.orderAfterUpdate(orderLeafId);

    // TODO: fill left reqs
    await this.accountAndTokenBeforeUpdate(accountLeafId, tokenId);
    await this.accountAndTokenAfterUpdate(accountLeafId, tokenId);
    const { r_chunks_bigint, o_chunks_bigint, isCriticalChunk } =
      this.getTxChunks(req);

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

  private async doRegister(
    req: TransactionInfo,
  ): Promise<TsRollupCircuitInputItemType> {
    const registerL2Addr = BigInt(req.arg0);
    const accountLeafId = registerL2Addr.toString();
    const registerTokenId = req.tokenAddr;
    // TODO: check if register has token
    // const t = {
    //   [req.tokenAddr as TsTokenAddress]: {
    //     amount: BigInt(req.amount),
    //     lockAmt: 0n,
    //   },
    // };
    // const tokenInfos = req.tokenAddr !== TsTokenAddress.Unknown && Number(req.amount) > 0 ? t : {};
    const accountInfo = await this.accountInfoRepository.findOneOrFail({
      where: {
        accountId: registerL2Addr.toString(),
      },
    });
    const hashedTsPubKey = accountInfo.hashedTsPubKey;
    const registerAccount = this.accountLeafNodeRepository.create();
    registerAccount.leafId = registerL2Addr.toString();
    registerAccount.tsAddr = hashedTsPubKey.toString();
    // const registerAccount = new TsRollupAccount(tokenInfos, this.config.token_tree_height, [BigInt(req.tsPubKeyX), BigInt(req.tsPubKeyY)]);
    const orderLeafId = '0';
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
    await this.accountAndTokenBeforeUpdate(accountLeafId, registerTokenId);

    /** update state */
    await this.addAccount(registerL2Addr, {
      l2Addr: registerL2Addr,
      tsAddr: hashedTsPubKey,
    });

    await this.accountAndTokenAfterUpdate(accountLeafId, registerTokenId);

    // TODO: fill left reqs
    await this.accountAndTokenBeforeUpdate(accountLeafId, registerTokenId);
    await this.accountAndTokenAfterUpdate(accountLeafId, registerTokenId);
    await this.orderBeforeUpdate(orderLeafId);
    await this.orderAfterUpdate(orderLeafId);

    const { r_chunks_bigint, o_chunks_bigint, isCriticalChunk } =
      this.getTxChunks(req);

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

  private async doWithdraw(
    req: TransactionInfo,
  ): Promise<TsRollupCircuitInputItemType> {
    const reqData = encodeRollupWithdrawMessage(req);
    const orderLeafId = '0';
    const transferL2AddrFrom = BigInt(req.accountId);
    const accountLeafId = req.accountId;
    const from = await this.getAccount(transferL2AddrFrom.toString());
    if (!from) {
      throw new Error(`doWithdraw account not found L2Addr=${from}`);
    }
    const newNonce = BigInt(from.nonce) + 1n;

    await this.accountAndTokenBeforeUpdate(accountLeafId, req.tokenAddr);
    await this.updateAccountToken(
      from.leafId,
      req.tokenAddr,
      -BigInt(req.amount),
      0n,
    );
    await this.updateAccountNonce(from.leafId, newNonce);
    await this.accountAndTokenAfterUpdate(accountLeafId, req.tokenAddr);

    await this.accountAndTokenBeforeUpdate(accountLeafId, req.tokenAddr);
    await this.accountAndTokenAfterUpdate(accountLeafId, req.tokenAddr);
    await this.orderBeforeUpdate(orderLeafId);
    await this.orderAfterUpdate(orderLeafId);

    const { r_chunks_bigint, o_chunks_bigint, isCriticalChunk } =
      this.getTxChunks(req);
    const tsPubKey = await this.getTsPubKey(accountLeafId);
    const tx = {
      reqData,
      tsPubKey, // Deposit tx not need signature
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
