import { recursiveToString } from '../helper';
import { TsMerkleTree } from '../merkle-tree-dp';
import { TsRollupCircuitInputItemType, TsRollupCircuitInputType } from '../ts-types/ts-circuit-types';
import { TsAccountLeafType, TsTokenLeafType } from '../ts-types/ts-merkletree.types';
import { ObsOrderLeaf, TsTxEntityRequest } from '../ts-types/ts-req-types';
import { CHUNK_BITS_SIZE, MAX_CHUNKS_PER_REQ, TsSystemAccountAddress, TsTokenAddress, TsTxType, TxNoop } from '../ts-types/ts-types';
import { TsRollupAccount } from './ts-account';
import { ITsAuctionOrder, NullifierEmptyItem, TsAuctionEmptyOrder } from './ts-obs-order';
import { RESERVED_ACCOUNTS } from './ts-env';
import { toTreeLeaf, tsHashFunc } from './ts-helper';
import { bigint_to_chunk_array, encodeRChunkBuffer, encodeTokenLeaf, txsToRollupCircuitInput } from './ts-tx-helper';
import { CircuitReqDataType, encodeRollupWithdrawMessage } from './ts-rollup-helper';
import assert from 'assert';
import { dpPoseidonHash } from '../poseidon-hash-dp';

export type TsRollupConfigType = {
  order_tree_height: number,
  l2_acc_addr_size: number,
  l2_token_addr_size: number,
  nullifier_tree_height: number,
  numOfChunks: number,

  numOfReqs: number,
  register_batch_size: number,
  token_tree_height: number,
  auction_market_count: number,
  auction_lender_count: number,
  auction_borrower_count: number,
}

interface CircuitAccountTxPayload { 
  r_accountLeafId: any[],
  r_oriAccountLeaf: Array<TsAccountLeafType>,
  r_newAccountLeaf: Array<TsAccountLeafType>,
  r_accountRootFlow: any[],
  r_accountMkPrf: Array<string[]>,
  r_tokenLeafId: Array<string[]>,
  r_oriTokenLeaf: TsTokenLeafType[],
  r_newTokenLeaf: TsTokenLeafType[],
  r_tokenRootFlow: Array<string[]>,
  r_tokenMkPrf: Array< string[]>
}
interface CircuitOrderTxPayload { 
  r_orderLeafId: Array<[string]>,
  r_oriOrderLeaf: Array<string[] | bigint[]>,
  r_newOrderLeaf: Array<string[] | bigint[]>,
  r_orderRootFlow: Array<string[]>,
  r_orderMkPrf: Array<string[]>,
}

interface CircuitNullifierTxPayload {
  r_nullifierLeafId: string[],
  r_oriNullifierLeaf: Array<string[] | bigint[]>,
  r_newNullifierLeaf: Array<string[] | bigint[]>,
  r_nullifierRootFlow: string[],
  r_nullifierMkPrf: Array<string[]>,
}


export enum RollupStatus {
    Unknown = 0,
    Idle,
    Running,
}

export enum RollupCircuitType {
  Unknown = 0,
  Register = 1,
  Transfer = 2,
}

export class RollupCore {
  // TODO: amt_size, l2_token_addr_size
  public config: TsRollupConfigType = {
    numOfChunks: 10,
    nullifier_tree_height: 8,
    numOfReqs: 10,
    register_batch_size: 1,
    l2_acc_addr_size: 12,
    l2_token_addr_size: 8,
    token_tree_height: 8,
    order_tree_height: 24,
    auction_market_count: 1,
    auction_lender_count: 100,
    auction_borrower_count: 100,
  };
  get txNormalPerBatch() {
    return this.config.numOfReqs;
  }
  get txRegisterPerBatch() {
    return this.config.register_batch_size;
  }

  public get stateRoot() {
    const accountTreeRoot = this.mkAccountTree.getRoot();
    const orderTreeRoot = this.mkOrderTree.getRoot();
    const oriTxNum = this.oriTxId;
    const oriTsRoot = '0x' + dpPoseidonHash([
      BigInt(orderTreeRoot), oriTxNum
    ]).toString(16).padStart(64, '0');
    const oriStateRoot = '0x' + dpPoseidonHash([
      BigInt(oriTsRoot), BigInt(accountTreeRoot)
    ]).toString(16).padStart(64, '0');
    return oriStateRoot;
  }
  public rollupStatus: RollupStatus = RollupStatus.Idle;

  // TODO: account state in Storage
  public accountList: TsRollupAccount[] = [];
  public mkAccountTree!: TsMerkleTree;
  get currentAccountAddr() {
    return this.accountList.length;
  }

  // TODO: auction order in Storage
  // leafId = 0 always be empty
  private orderMap: {[k: number | string]: ObsOrderLeaf} = {};
  public mkOrderTree!: TsMerkleTree;
  private currentOrderId = 1; // 0 is default empty order

  // TODO: nullifier state in Storage
  public nullifierList: {[k: number | string]: NullifierEmptyItem} = {};
  public mkNullifierTree!: TsMerkleTree;
  public currentNullifierId = 0n;
  public currentEpoch = 0n;


  /** Block information */
  public blockNumber = 0n;
  public oriTxId = 0n;
  get latestTxId() {
    return this.oriTxId + BigInt(this.currentTxLogs.length);
  }
  private currentTxLogs: any[] = [];
  private currentAccountRootFlow: bigint[] = [];
  private currentOrderRootFlow: bigint[] = [];
  private currentNullifierRootFlow: bigint[] = [];
  private currentEpochFlow: bigint[] = [];
  /** Transaction Information */
  private currentAccountPayload: CircuitAccountTxPayload = this.prepareTxAccountPayload();
  private currentOrderPayload: CircuitOrderTxPayload = this.prepareTxOrderPayload();
  private currentNullifierPayload: CircuitNullifierTxPayload = this.prepareTxNullifierPayload();

  private blockLogs: Map<string, {
        logs: any[],
        accountRootFlow: bigint[]
        auctionOrderRootFlow: bigint[]
    }> = new Map();
  // TODO: add rollup circuit logs
  public defaultTokenLeaf: TsTokenLeafType = [0n, 0n];
  public defaultTokenTree!: TsMerkleTree;
  public defaultTokenRoot!: bigint;
  public defaultAccountLeafData!: [bigint, bigint, bigint];
  public getDefaultOrder = () => new ObsOrderLeaf(
    0n, TsTxType.UNKNOWN, 0n, 0n, 0n, 0n,
    0n, 0n, 0n, 0n,
  );
  public defailtOrderLeafHash = this.getDefaultOrder().encodeLeafMessageForHash();
  constructor(config: Partial<TsRollupConfigType>) {
    this.config = {...this.config, ...config};
        
    this.defaultTokenTree = new TsMerkleTree(
      [],
      this.config.token_tree_height, tsHashFunc,
      toTreeLeaf(this.defaultTokenLeaf)
    );
    this.defaultTokenRoot = BigInt(this.defaultTokenTree.getRoot());
    this.defaultAccountLeafData = [0n, 0n, this.defaultTokenRoot];
    this.initAccountTree();
    this.initOrderTree();
    this.initNullifierTree();

  }

  private initAccountTree() {
    this.mkAccountTree = new TsMerkleTree(
      this.accountList.map(a => toTreeLeaf(a.encodeAccountLeaf())),
      this.config.l2_acc_addr_size, tsHashFunc,
      toTreeLeaf(this.defaultAccountLeafData)
    );

    /**
     * Initial system accounts
     * 0: L2BurnAccount
     * 1: L2MintAccount
     * 2: L2AuctionAccount
     * ~100: RESERVED_ACCOUNTS, reserve system accounts 
     */
    const systemAccountNum = Number(RESERVED_ACCOUNTS);
    for (let index = 0; index < systemAccountNum; index++) {
      // INFO: Default token Tree
      this.addAccount(index, new TsRollupAccount(
        {},
        this.config.token_tree_height,
        [0n, 0n],
      ));
    }

    // TODO: initial registered accounts from storage.
  }

  private initOrderTree() {
    this.orderMap[0] = this.getDefaultOrder();
    this.mkOrderTree = new TsMerkleTree(
      Object.entries(this.orderMap).sort((a, b) => Number(a[0]) - Number(b[0])).map((o) => o[1].encodeLeafMessageForHash()),
      this.config.order_tree_height,
      tsHashFunc,
      this.defailtOrderLeafHash
    );
  }

  private initNullifierTree() {
    // TODO: initial nullifier from storage.
    this.mkNullifierTree = new TsMerkleTree(
      Object.values(this.nullifierList).map((n) => n.encodeHash()),
      this.config.nullifier_tree_height,
      tsHashFunc,
      '0x00'
    );
  }

  /** Order */
  getOrderMap() {
    return this.orderMap;
  }

  getObsOrder(orderId: number): ObsOrderLeaf | undefined {
    return this.orderMap[orderId];
  }

  /** Account */
  getAccount(accAddr: bigint): TsRollupAccount | null {
    const acc = this.accountList[Number(accAddr)];

    if(!acc) {
      return null;
    }
    return acc;
  }

  getAccountProof(accAddr: bigint) {
    return this.mkAccountTree.getProof(Number(accAddr));
  }

  addAccount(l2addr: number, account: TsRollupAccount): number {
    if(this.currentAccountAddr !== 0 && l2addr.toString() === TsSystemAccountAddress.BURN_ADDR) {
      // TODO: for empty main tx request
      return 0;
    }
    if(this.currentAccountAddr !== l2addr) {
      throw new Error(`addAccount: l2addr=${l2addr} not match l2 account counter (${this.currentAccountAddr})`);
    }
    this.accountList.push(account);
    account.setAccountAddress(BigInt(l2addr));

    this.mkAccountTree.updateLeafNode(
      this.currentAccountAddr - 1,
      toTreeLeaf(account.encodeAccountLeaf()),
    );
    return l2addr;
  }

  private updateAccountToken(accountId: bigint, tokenAddr: TsTokenAddress, tokenAmt: bigint, lockedAmt: bigint) {
    const acc = this.getAccount(accountId);
    if(!acc) {
      throw new Error(`updateAccountToken: account id=${accountId} not found`);
    }
    const newTokenRoot = acc.updateToken(tokenAddr, tokenAmt, lockedAmt);
    this.mkAccountTree.updateLeafNode(
      Number(accountId),
      toTreeLeaf(acc.encodeAccountLeaf()),
    );
    return {
      newTokenRoot,
    };
  }
  private updateAccountNonce(accountId: bigint, nonce: bigint) {
    const acc = this.getAccount(accountId);
    if(!acc) {
      throw new Error(`updateAccountNonce: account id=${accountId} not found`);
    }
    acc.updateNonce(nonce);
    this.mkAccountTree.updateLeafNode(
      Number(accountId),
      toTreeLeaf(acc.encodeAccountLeaf()),
    );
  }

  /** Rollup trace */
  private addFirstRootFlow() {
    if(this.currentAccountRootFlow.length !== 0 
      || this.currentOrderRootFlow.length !== 0) {
      throw new Error('addFirstRootFlow must run on new block');
    }
    this.addAccountRootFlow();
    this.addOrderRootFlow();
    this.addNullifierRootFlow();
    this.addEpochFlow();
  }

  private flushBlock(blocknumber: bigint) {
    if(this.blockLogs.has(blocknumber.toString())) {
      throw new Error(`Block ${blocknumber} already exist`);
    }
    const logs = {...this.currentTxLogs};
    const accountRootFlow = [...this.currentAccountRootFlow];
    const auctionOrderRootFlow = [...this.currentOrderRootFlow];
    this.blockNumber = blocknumber;
    this.currentAccountRootFlow = [];
    this.currentOrderRootFlow = [];
    this.currentNullifierRootFlow = [];
    this.currentEpochFlow = [];
    this.currentTxLogs = [];

    this.currentAccountPayload = this.prepareTxAccountPayload();
    this.currentOrderPayload = this.prepareTxOrderPayload();
    this.currentNullifierPayload = this.prepareTxNullifierPayload();

    this.blockLogs.set(blocknumber.toString(), {
      logs,
      accountRootFlow,
      auctionOrderRootFlow,
    });
  }

  private addAccountRootFlow() {
    this.currentAccountRootFlow.push(BigInt(this.mkAccountTree.getRoot()));
  }

  private addOrderRootFlow() {
    this.currentOrderRootFlow.push(BigInt(this.mkOrderTree.getRoot()));
  }

  private addNullifierRootFlow() {
    this.currentNullifierRootFlow.push(BigInt(this.mkNullifierTree.getRoot()));
  }

  private addEpochFlow() {
    this.currentEpochFlow.push(this.currentEpoch);
  }



  private addTxLogs(detail: any) {
    this.currentTxLogs.push(detail);
  }

  /** Rollup Transaction */
  // TODO: refactor method to retrict RollupCircuitType
  async startRollup(callback: (that: RollupCore, blockNumber: bigint) => Promise<void>): Promise<{
    blockNumber: bigint,
    inputs?: TsRollupCircuitInputType,
  }> {
    const perBatch = this.txNormalPerBatch;
    if(this.rollupStatus === RollupStatus.Running) {
      throw new Error('Rollup is running');
    }
    this.rollupStatus = RollupStatus.Running;

    const newBlockNumber = this.blockNumber + 1n;
    this.addFirstRootFlow();
    // TODO: rollback state if callback failed
    await callback(this, newBlockNumber);
    if(this.currentTxLogs.length !== perBatch) {
      console.log(`Rollup txNumbers=${this.currentTxLogs.length} not match txPerBatch=${perBatch}`);
      const emptyTxNum = perBatch - this.currentTxLogs.length;
      for(let i = 0; i < emptyTxNum; i++) {
        await this.doTransaction(TxNoop);
      }
    }
    // const circuitInputs = exportTransferCircuitInput(this.currentTxLogs, this.txId, this.currentAccountRootFlow, this.currentAuctionOrderRootFlow);

    const circuitInputs = txsToRollupCircuitInput(this.currentTxLogs) as any;
    // TODO: type check

    circuitInputs['o_chunks'] = circuitInputs['o_chunks'].flat();
    const o_chunk_remains = this.config.numOfChunks - circuitInputs['o_chunks'].length;
    circuitInputs['isCriticalChunk'] = circuitInputs['isCriticalChunk'].flat();
    assert(circuitInputs['isCriticalChunk'].length === circuitInputs['o_chunks'].length, `isCriticalChunk=${circuitInputs['isCriticalChunk'].length} length not match o_chunks=${circuitInputs['o_chunks'].length} `);
    for (let index = 0; index < o_chunk_remains; index++) {
      circuitInputs['o_chunks'].push('0');
      circuitInputs['isCriticalChunk'].push('0');
    }
    assert(circuitInputs['o_chunks'].length === this.config.numOfChunks, `o_chunks=${circuitInputs['o_chunks'].length} length not match numOfChunks=${this.config.numOfChunks} `);
    assert(circuitInputs['isCriticalChunk'].length === this.config.numOfChunks, `isCriticalChunk=${circuitInputs['isCriticalChunk'].length} length not match numOfChunks=${this.config.numOfChunks} `);
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
    circuitInputs['accountRootFlow'] = this.currentAccountRootFlow.map(x => recursiveToString(x));
    circuitInputs['orderRootFlow'] = this.currentOrderRootFlow.map(x => recursiveToString(x));
    this.oriTxId = this.latestTxId;
    this.flushBlock(newBlockNumber);
    this.rollupStatus = RollupStatus.Idle;

    return {
      blockNumber: newBlockNumber,
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


  private accountBeforeUpdate(accountLeafId: bigint, tokenAddr: TsTokenAddress) {
    const account = this.getAccount(accountLeafId);
    if(this.currentAccountPayload.r_accountLeafId[this.currentAccountPayload.r_accountLeafId.length - 1]?.length === 1) {
      this.currentAccountPayload.r_accountLeafId[this.currentAccountPayload.r_accountLeafId.length - 1].push(accountLeafId);
    } else {
      this.currentAccountPayload.r_accountLeafId.push([accountLeafId]);
    }
    if(this.currentAccountPayload.r_tokenLeafId[this.currentAccountPayload.r_tokenLeafId.length - 1]?.length === 1) {
      this.currentAccountPayload.r_tokenLeafId[this.currentAccountPayload.r_tokenLeafId.length - 1].push(tokenAddr);
    } else {
      this.currentAccountPayload.r_tokenLeafId.push([tokenAddr]);
    }
    if(!account) {
      this.currentAccountPayload.r_oriAccountLeaf.push(this.defaultAccountLeafData);
      this.currentAccountPayload.r_accountRootFlow.push([
        this.mkAccountTree.getRoot()
      ]);
      this.currentAccountPayload.r_accountMkPrf.push(this.getAccountProof(accountLeafId));
      this.currentAccountPayload.r_tokenRootFlow.push([
        `0x${this.defaultTokenRoot.toString(16)}`
      ]);

      this.currentAccountPayload.r_oriTokenLeaf.push(this.defaultTokenLeaf);
      this.currentAccountPayload.r_tokenMkPrf.push(this.defaultTokenTree.getProof(0));
    } else {
      const tokenInfo = account.getTokenLeaf(tokenAddr);  
      this.currentAccountPayload.r_oriAccountLeaf.push(account.encodeAccountLeaf());
      this.currentAccountPayload.r_accountRootFlow.push([
        this.mkAccountTree.getRoot()
      ]);
      this.currentAccountPayload.r_accountMkPrf.push(this.getAccountProof(accountLeafId));
      this.currentAccountPayload.r_tokenRootFlow.push([
        account.getTokenRoot()
      ]);
      
      this.currentAccountPayload.r_oriTokenLeaf.push(encodeTokenLeaf(tokenInfo.leaf));
      this.currentAccountPayload.r_tokenMkPrf.push(account.tokenTree.getProof(Number(tokenInfo.leafId)));
    }

  }


  private accountAfterUpdate(accountLeafId: bigint, tokenAddr: TsTokenAddress) {
    const account = this.getAccount(accountLeafId);
    if(!account) {
      throw new Error('accountAfterUpdate: account not found');
    }
    const tokenInfo = account.getTokenLeaf(tokenAddr);
    const idx = this.currentAccountPayload.r_accountRootFlow.length -1;
    this.currentAccountPayload.r_newAccountLeaf.push(account.encodeAccountLeaf());
    this.currentAccountPayload.r_accountRootFlow[idx].push(
      this.mkAccountTree.getRoot()
    );
    this.currentAccountPayload.r_newTokenLeaf.push(encodeTokenLeaf(tokenInfo.leaf));

    this.currentAccountPayload.r_tokenRootFlow[idx].push(
      account.getTokenRoot()
    );

  }

  private orderBeforeUpdate(orderLeafId: number) {
    const order = this.getObsOrder(orderLeafId);
    this.currentOrderPayload.r_orderLeafId.push([orderLeafId.toString()]);
    
    if(order) {
  
      this.currentOrderPayload.r_oriOrderLeaf.push(order.encodeLeafMessage());
      this.currentOrderPayload.r_orderRootFlow.push(
        [BigInt(this.mkOrderTree.getRoot()).toString()]
      );
      this.currentOrderPayload.r_orderMkPrf.push(this.mkOrderTree.getProof(orderLeafId));
    } else {  
      this.currentOrderPayload.r_oriOrderLeaf.push(this.getDefaultOrder().encodeLeafMessage());
      this.currentOrderPayload.r_orderRootFlow.push(
        [BigInt(this.mkOrderTree.getRoot()).toString()]
      );
      this.currentOrderPayload.r_orderMkPrf.push(this.mkOrderTree.getProof(orderLeafId));
    }
  }

  private orderAfterUpdate(orderLeafId: number) {
    const order = this.getObsOrder(orderLeafId);
    this.currentOrderPayload.r_orderRootFlow[
      this.currentOrderPayload.r_orderRootFlow.length - 1
    ].push(
      BigInt(this.mkOrderTree.getRoot()).toString()
    );
    if(order) {
      this.currentOrderPayload.r_newOrderLeaf.push(order.encodeLeafMessage());
      // this.currentOrderPayload.r_orderMkPrf.push(this.mkOrderTree.getProof(orderLeafId));
    } else {
      this.currentOrderPayload.r_newOrderLeaf.push(this.getDefaultOrder().encodeLeafMessage());
    }
  }

  private addObsOrder(order: ObsOrderLeaf) {
    if(order.orderLeafId > 0n) {
      throw new Error('addObsOrder: orderLeafId should be 0');
    }
    order.setOrderLeafId(BigInt(this.currentOrderId));
    this.orderMap[this.currentOrderId] = order;
    this.mkOrderTree.updateLeafNode(this.currentOrderId, order.encodeLeafMessageForHash());
    this.currentOrderId++;
  }
  private removeObsOrder(leafId: number) {
    const order = this.getObsOrder(leafId);
    if(!order) {
      throw new Error('removeObsOrder: order not found');
    }
    this.orderMap[leafId] = this.getDefaultOrder();
    this.mkOrderTree.updateLeafNode(leafId, this.orderMap[leafId].encodeLeafMessageForHash());
  }
  private updateObsOrder(order: ObsOrderLeaf) {
    assert(order.orderLeafId > 0n, 'updateObsOrder: orderLeafId should be exist');
    this.orderMap[this.currentOrderId] = order;
    this.mkOrderTree.updateLeafNode(this.currentOrderId, order.encodeLeafMessageForHash());
  }
  private matchObsOrder(leafId: number, addAccumulatedSellAmt: bigint, addAccumulatedBuyAmt: bigint) {
    const order = this.getObsOrder(leafId);
    if(!order) {
      throw new Error('removeObsOrder: order not found');
    }
    order.accumulatedSellAmt += addAccumulatedSellAmt;
    order.accumulatedBuyAmt += addAccumulatedBuyAmt;
    assert(order.accumulatedSellAmt >= 0n, 'accumulatedSellAmt should be positive');
    assert(order.accumulatedBuyAmt >= 0n, 'accumulatedBuyAmt should be positive');
    this.orderMap[leafId] = order;
    this.mkOrderTree.updateLeafNode(leafId, order.encodeLeafMessageForHash());
  }
  
  private getTxChunks(txEntity: TsTxEntityRequest, metadata?: {
    txOffset: bigint,
    buyAmt: bigint,
  }) {
    const { r_chunks, o_chunks, isCritical } = encodeRChunkBuffer(txEntity, metadata);
    
    // TODO multiple txs need handle o_chunks in end of block;
    const r_chunks_bigint = bigint_to_chunk_array(BigInt('0x' + r_chunks.toString('hex')), BigInt(CHUNK_BITS_SIZE));
    const o_chunks_bigint = bigint_to_chunk_array(BigInt('0x' + o_chunks.toString('hex')), BigInt(CHUNK_BITS_SIZE));
    const isCriticalChunk = o_chunks_bigint.map(_ => '0');
    if (isCritical) {
      isCriticalChunk[0] = '1';
    }

    return { r_chunks_bigint, o_chunks_bigint, isCriticalChunk };
  }

  async doTransaction(req: TsTxEntityRequest): Promise<TsRollupCircuitInputItemType> {
    // if(![
    //   TsTxType.AUCTION_CANCEL,].includes(req.reqType)) {
    // }
    let inputs: TsRollupCircuitInputItemType;
    switch (req.reqType) {
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
        break;
    }

    this.addAccountRootFlow();
    this.addOrderRootFlow();
    return inputs;
  }

  private async doSecondLimitOrder(req: TsTxEntityRequest): Promise<TsRollupCircuitInputItemType> {
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
    const from = this.getAccount(req.accountId);
    if(!from) {
      throw new Error(`account not found L2Addr=${from}`);
    }
    const newNonce = from.nonce + 1n;
    const tokenAddr = req.tokenAddr;
    
    this.accountBeforeUpdate(req.accountId, tokenAddr);
    this.updateAccountToken(req.accountId, tokenAddr, -BigInt(req.amount), BigInt(req.amount));
    this.updateAccountNonce(req.accountId, newNonce);
    this.accountAfterUpdate(req.accountId, tokenAddr);

    this.accountBeforeUpdate(req.accountId, tokenAddr);
    this.accountAfterUpdate(req.accountId, tokenAddr);

    const orderLeafId = this.currentOrderId;
    const txId = this.latestTxId;
    const order = new ObsOrderLeaf(
      txId,
      req.reqType,
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

    const tx =  {
      reqData,
      tsPubKey: from.tsPubKey, // Deposit tx not need signature
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

  private currentHoldTakerOrder:  ObsOrderLeaf | null = null;
  doSecondLimitStart(req: TsTxEntityRequest) {
    const reqData: CircuitReqDataType = [
      BigInt(TsTxType.SecondLimitStart),
      0n,0n,0n,0n,
      0n,0n,0n,0n,req.arg4
    ];
    const orderLeafId = Number(req.arg4);
    const order = this.getObsOrder(orderLeafId);
    if(!order) {
      throw new Error(`doCancelOrder: order not found orderLeafId=${orderLeafId}`);
    }
    if(order.sender === 0n) {
      throw new Error(`doCancelOrder: order not found orderLeafId=${orderLeafId} (order.sender=0)`);
    }
    this.currentHoldTakerOrder = order;
    const from = this.getAccount(order.sender);
    if(!from) {
      throw new Error(`account not found L2Addr=${from}`);
    }
    const sellTokenId = order.sellTokenId.toString() as TsTokenAddress;

    this.accountBeforeUpdate(order.sender, sellTokenId);
    this.accountAfterUpdate(order.sender, sellTokenId);
    this.accountBeforeUpdate(order.sender, sellTokenId);
    this.accountAfterUpdate(order.sender, sellTokenId);

    this.orderBeforeUpdate(orderLeafId);
    this.removeObsOrder(orderLeafId);
    this.orderAfterUpdate(orderLeafId);

    const txId = this.latestTxId;
    const { r_chunks_bigint, o_chunks_bigint, isCriticalChunk } = this.getTxChunks(req, {
      txOffset: txId - order.txId,
      buyAmt: 0n,
    });

    const tx =  {
      reqData,
      tsPubKey: from.tsPubKey, // Deposit tx not need signature
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
  doSecondLimitExchange(req: TsTxEntityRequest) {
    const reqData: CircuitReqDataType = [
      BigInt(TsTxType.SecondLimitExchange),
      0n,0n,0n,0n,
      0n,0n,0n,0n,req.arg4
    ];
    const orderLeafId = Number(req.arg4);
    const makerOrder = this.getObsOrder(orderLeafId);
    if(!makerOrder) {
      throw new Error(`doCancelOrder: order not found orderLeafId=${orderLeafId}`);
    }
    if(makerOrder.sender === 0n) {
      throw new Error(`doCancelOrder: order not found orderLeafId=${orderLeafId} (order.sender=0)`);
    }
    const makerAcc = this.getAccount(makerOrder.sender);
    if(!makerAcc) {
      throw new Error(`account not found L2Addr=${makerOrder.sender}`);
    }
    const sellTokenId = makerOrder.sellTokenId.toString() as TsTokenAddress;
    const buyTokenId = makerOrder.buyTokenId.toString() as TsTokenAddress;

    console.log({
      makerOrder,
      makerOrderAmout: makerOrder.sellAmt,
      makerOrderAccumulated: req.accumulatedSellAmt,
    });
    this.accountBeforeUpdate(makerOrder.sender, buyTokenId);
    this.updateAccountToken(makerAcc.L2Address, buyTokenId, req.accumulatedBuyAmt, 0n);
    this.accountAfterUpdate(makerOrder.sender, buyTokenId);

    this.accountBeforeUpdate(makerOrder.sender, sellTokenId);
    this.updateAccountToken(makerAcc.L2Address, sellTokenId, 0n, -req.accumulatedSellAmt);
    this.accountAfterUpdate(makerOrder.sender, sellTokenId);

    this.orderBeforeUpdate(orderLeafId);
    makerOrder.accumulatedSellAmt += req.accumulatedSellAmt;
    makerOrder.accumulatedBuyAmt += req.accumulatedBuyAmt;
    const isAllSellAmtMatched = makerOrder.accumulatedSellAmt === makerOrder.sellAmt;
    if(isAllSellAmtMatched) {
      this.removeObsOrder(orderLeafId);
    } else {
      this.updateObsOrder(makerOrder);
    }
    this.orderAfterUpdate(orderLeafId);

    const txId = this.latestTxId;
    const { r_chunks_bigint, o_chunks_bigint, isCriticalChunk } = this.getTxChunks(req, {
      txOffset: txId - makerOrder.txId,
      buyAmt: req.accumulatedBuyAmt,
    });

    const tx =  {
      reqData,
      tsPubKey: makerAcc.tsPubKey, // Deposit tx not need signature
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
  doSecondLimitEnd(req: TsTxEntityRequest) {
    assert(!!this.currentHoldTakerOrder, 'doSecondLimitEnd: currentHoldTakerOrder is null');
    const reqData: CircuitReqDataType = [
      BigInt(TsTxType.SecondLimitEnd),
      0n,0n,0n,0n,
      0n,0n,0n,0n,req.arg4
    ];
    const orderLeafId = Number(req.arg4);
    assert(orderLeafId === Number(this.currentHoldTakerOrder.orderLeafId), 'doSecondLimitEnd: orderLeafId not match');
    const takerOrder = this.currentHoldTakerOrder;
    if(!takerOrder) {
      throw new Error(`doSecondLimitEnd: order not found orderLeafId=${orderLeafId}`);
    }
    if(takerOrder.sender === 0n) {
      throw new Error(`doSecondLimitEnd: order not found orderLeafId=${orderLeafId} (order.sender=0)`);
    }
    const takerAcc = this.getAccount(takerOrder.sender);
    if(!takerAcc) {
      throw new Error(`account not found L2Addr=${takerOrder.sender}`);
    }
    const sellTokenId = takerOrder.sellTokenId.toString() as TsTokenAddress;
    const buyTokenId = takerOrder.buyTokenId.toString() as TsTokenAddress;

    
    this.accountBeforeUpdate(takerOrder.sender, buyTokenId);
    this.updateAccountToken(takerAcc.L2Address, buyTokenId, req.accumulatedBuyAmt, 0n);
    this.accountAfterUpdate(takerOrder.sender, buyTokenId);

    this.accountBeforeUpdate(takerOrder.sender, sellTokenId);
    console.log({
      takerLkt: takerAcc.getTokenLeaf(sellTokenId),
      accumulatedSellAmt: req.accumulatedSellAmt,
      
    });
    this.updateAccountToken(takerAcc.L2Address, sellTokenId, req.accumulatedSellAmt, -req.accumulatedSellAmt);
    this.accountAfterUpdate(takerOrder.sender, sellTokenId);

    this.orderBeforeUpdate(orderLeafId);
    takerOrder.accumulatedSellAmt += req.accumulatedSellAmt;
    takerOrder.accumulatedBuyAmt += req.accumulatedBuyAmt;
    const isAllSellAmtMatched = takerOrder.accumulatedSellAmt === takerOrder.sellAmt;
    if(isAllSellAmtMatched) {
      this.removeObsOrder(orderLeafId);
    } else {
      this.updateObsOrder(takerOrder);
    }
    this.orderAfterUpdate(orderLeafId);

    const txId = this.latestTxId;
    const { r_chunks_bigint, o_chunks_bigint, isCriticalChunk } = this.getTxChunks(req, {
      txOffset: txId - takerOrder.txId,
      buyAmt: req.accumulatedBuyAmt,
    });

    this.currentHoldTakerOrder = null;
    const tx =  {
      reqData,
      tsPubKey: takerAcc.tsPubKey, // Deposit tx not need signature
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

  doCancelOrder(req: TsTxEntityRequest) {
    const orderLeafId = req.arg4;
    const reqData: CircuitReqDataType = [
      BigInt(TsTxType.CancelOrder),
      0n,0n,0n,0n,
      req.arg0,orderLeafId,0n,0n,0n,
    ];
    const order = this.getObsOrder(Number(orderLeafId));
    if(!order) {
      throw new Error(`doCancelOrder: order not found orderLeafId=${orderLeafId}`);
    }
    if(order.sender === 0n) {
      throw new Error(`doCancelOrder: order not found orderLeafId=${orderLeafId} (order.sender=0)`);
    }
    const account = this.getAccount(order.sender);
    if(!account) {
      throw new Error(`doCancelOrder: account not found L2Addr=${order.sender}`);
    }
    if(req.arg0 !== account.L2Address) {
      throw new Error(`doCancelOrder: account not match L2Addr=${order.sender} req.arg0=${req.arg0}`);
    }
    const refundTokenAddr = order.sellTokenId.toString() as TsTokenAddress;
    const refundAmount = order.sellAmt - order.accumulatedSellAmt;

    this.accountBeforeUpdate(account.L2Address, refundTokenAddr);
    this.updateAccountToken(account.L2Address, refundTokenAddr, BigInt(refundAmount), -BigInt(refundAmount));
    this.accountAfterUpdate(account.L2Address, refundTokenAddr);
    this.accountBeforeUpdate(account.L2Address, refundTokenAddr);
    this.accountAfterUpdate(account.L2Address, refundTokenAddr);

    this.orderBeforeUpdate(Number(order));
    this.removeObsOrder(Number(order));
    this.orderAfterUpdate(Number(order));

    const { r_chunks_bigint, o_chunks_bigint, isCriticalChunk } = this.getTxChunks(req);

    const tx =  {
      reqData,
      tsPubKey: account.tsPubKey, // Deposit tx not need signature
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
    const orderLeafId = 0;
    const account = this.getAccount(0n);
    if(!account) {
      throw new Error('doNoop: account not found');
    }
    this.accountBeforeUpdate(account.L2Address, TsTokenAddress.Unknown);
    this.accountAfterUpdate(account.L2Address, TsTokenAddress.Unknown);
    this.accountBeforeUpdate(account.L2Address, TsTokenAddress.Unknown);
    this.accountAfterUpdate(account.L2Address, TsTokenAddress.Unknown);
    this.orderBeforeUpdate(orderLeafId);
    this.orderAfterUpdate(orderLeafId);
    const tx =  {
      reqData: [0n, 0n,0n, 0n,0n, 0n,0n, 0n,0n, 0n],
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

  private async doDeposit(req: TsTxEntityRequest) {
    const depositL2Addr = BigInt(req.arg0);
    const reqData = [
      BigInt(TsTxType.DEPOSIT), 
      BigInt(TsSystemAccountAddress.MINT_ADDR),
      BigInt(req.tokenId),
      BigInt(req.amount),
      BigInt(req.nonce),
      depositL2Addr,
      0n, 0n, 0n, 0n,
    ];
    const orderLeafId = 0;
    const depositAccount = this.getAccount(depositL2Addr);
    if(!depositAccount) {
      throw new Error(`Deposit account not found L2Addr=${depositL2Addr}`);
    }
    const tokenId = req.tokenId.toString() as TsTokenAddress;

    this.accountBeforeUpdate(depositL2Addr, tokenId);
    this.orderBeforeUpdate(orderLeafId);
    
    this.updateAccountToken(depositL2Addr, tokenId, req.amount, 0n);

    this.accountAfterUpdate(depositL2Addr, tokenId);
    this.orderAfterUpdate(orderLeafId);

    // TODO: fill left reqs
    this.accountBeforeUpdate(depositL2Addr, tokenId);
    this.accountAfterUpdate(depositL2Addr, tokenId);
    // this.orderBeforeUpdate(orderLeafId);
    // this.orderAfterUpdate(orderLeafId);
    const { r_chunks_bigint, o_chunks_bigint, isCriticalChunk } = this.getTxChunks(req);

    const tx =  {
      reqData,
      tsPubKey: depositAccount.tsPubKey, // Deposit tx not need signature
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

  // private async doTransfer(txTransferReq: TsTxTransferRequest) {
  //   const reqData = encodeTxTransferMessage(txTransferReq);
  //   const orderLeafId = 0;
  //   const transferL2AddrFrom = BigInt(txTransferReq.L2AddrFrom);
  //   const transferL2AddrTo = BigInt(txTransferReq.L2AddrTo);
  //   const from = this.getAccount(transferL2AddrFrom);
  //   const to = this.getAccount(transferL2AddrTo);
  //   if(!from || !to) {
  //     throw new Error(`Deposit account not found L2Addr=${from}`);
  //   }
  //   const tokenInfoFrom = from.getTokenLeaf(txTransferReq.L2TokenAddr);
  //   const tokenInfoTo = to.getTokenLeaf(txTransferReq.L2TokenAddr);
  //   const newNonce = from.nonce + 1n;
  //   txTransferReq.L2TokenLeafIdFrom = tokenInfoFrom.leafId.toString();
  //   txTransferReq.L2TokenLeafIdTo = tokenInfoTo.leafId.toString();
   
  //   this.accountBeforeUpdate(transferL2AddrFrom, txTransferReq.L2TokenAddr);
    
  //   this.updateAccountToken(transferL2AddrFrom, txTransferReq.L2TokenAddr, -BigInt(txTransferReq.amount), 0n);
  //   this.updateAccountNonce(transferL2AddrFrom, newNonce);
  //   this.accountAfterUpdate(transferL2AddrFrom, txTransferReq.L2TokenAddr);
  //   this.accountBeforeUpdate(transferL2AddrTo, txTransferReq.L2TokenAddr);
  //   this.updateAccountToken(transferL2AddrTo, txTransferReq.L2TokenAddr, BigInt(txTransferReq.amount), 0n);
  //   this.accountAfterUpdate(transferL2AddrTo, txTransferReq.L2TokenAddr);

  //   this.orderBeforeUpdate(orderLeafId);
  //   this.orderAfterUpdate(orderLeafId);
  //   const { r_chunks_bigint, o_chunks_bigint, isCriticalChunk } = this.getTxChunks(txTransferReq);

  //   const tx =  {
  //     reqData,
  //     tsPubKey: from.tsPubKey, // Deposit tx not need signature
  //     sigR: txTransferReq.eddsaSig.R8,
  //     sigS: txTransferReq.eddsaSig.S,

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

  private async doRegister(req: TsTxEntityRequest): Promise<TsRollupCircuitInputItemType> {
    const registerL2Addr = req.arg0;
    const registerTokenId = req.tokenAddr;
    const tokenInfos = req.tokenAddr !== TsTokenAddress.Unknown && Number(req.amount) > 0
      ? {
        [req.tokenAddr as TsTokenAddress]: {
          amount: BigInt(req.amount),
          lockAmt: 0n,
        }
      }
      : {};
    const registerAccount = new TsRollupAccount(
      tokenInfos,
      this.config.token_tree_height,
      [BigInt(req.tsPubKeyX), BigInt(req.tsPubKeyY)],
    );
    const orderLeafId = 0;
    const hashedTsPubKey = registerAccount.hashedTsPubKey;
    const reqData = [
      BigInt(TsTxType.REGISTER), 
      BigInt(TsSystemAccountAddress.MINT_ADDR),
      BigInt(req.tokenId),
      BigInt(req.amount),
      BigInt(0),
      registerL2Addr,
      hashedTsPubKey,
      0n, 0n, 0n, 
    ];
    this.accountBeforeUpdate(registerL2Addr, registerTokenId);
    this.orderBeforeUpdate(orderLeafId);

    /** update state */
    this.addAccount(Number(registerL2Addr), registerAccount);

    this.accountAfterUpdate(registerL2Addr, registerTokenId);
    this.orderAfterUpdate(orderLeafId);

    // TODO: fill left reqs
    this.accountBeforeUpdate(registerL2Addr, registerTokenId);
    this.accountAfterUpdate(registerL2Addr, registerTokenId);
    // this.orderBeforeUpdate(orderLeafId);
    // this.orderAfterUpdate(orderLeafId);

    const { r_chunks_bigint, o_chunks_bigint, isCriticalChunk } = this.getTxChunks(req);

    const tx = {
      reqData,
      tsPubKey: [
        req.tsPubKeyX, req.tsPubKeyY
      ], 
      sigR: ['0', '0'], // register account no need sig
      sigS: '0',       // register account no need sig

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

  private async doWithdraw(req: TsTxEntityRequest): Promise<TsRollupCircuitInputItemType> {
    const reqData = encodeRollupWithdrawMessage(req);
    const orderLeafId = 0;
    const transferL2AddrFrom = BigInt(req.accountId);
    const from = this.getAccount(transferL2AddrFrom);
    if(!from) {
      throw new Error(`Deposit account not found L2Addr=${from}`);
    }
    const newNonce = from.nonce + 1n;
   
    this.accountBeforeUpdate(transferL2AddrFrom, req.tokenAddr);
    this.updateAccountToken(transferL2AddrFrom, req.tokenAddr, -BigInt(req.amount), 0n);
    this.updateAccountNonce(transferL2AddrFrom, newNonce);
    this.accountAfterUpdate(transferL2AddrFrom, req.tokenAddr);

    this.accountBeforeUpdate(transferL2AddrFrom, req.tokenAddr);
    this.accountAfterUpdate(transferL2AddrFrom, req.tokenAddr);
    this.orderBeforeUpdate(orderLeafId);
    this.orderAfterUpdate(orderLeafId);


    const { r_chunks_bigint, o_chunks_bigint, isCriticalChunk } = this.getTxChunks(req);

    const tx =  {
      reqData,
      tsPubKey: from.tsPubKey, // Deposit tx not need signature
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

  // private async doAuctionCancel(req: TsTxAuctionCancelRequest): Promise<TsRollupCircuitInputItemType> {
  //   const orderLeafId = Number(req.orderLeafId);
  //   let tokenAddrRefund!: TsTokenAddress;
  //   const order = this.getAuctionOrder(orderLeafId);
  //   if(order.reqType === TsTxType.UNKNOWN) {
  //     throw new Error(`orderLeafId=${orderLeafId} not found`);
  //   }
  //   if(order.reqType === TsTxType.AUCTION_LEND) {
  //     tokenAddrRefund = order.L2TokenAddrLending;
  //   }
  //   if(order.reqType === TsTxType.AUCTION_BORROW) {
  //     tokenAddrRefund = order.L2TokenAddrCollateral;
  //   }
  //   if(order.L2AddrFrom.toString() !== req.L2AddrReceiver) {
  //     throw new Error(`orderLeafId=${orderLeafId} L2AddrFrom=${order.L2AddrFrom} not match L2AddrReceiver=${req.L2AddrReceiver}`);
  //   }
  //   const reqData = encodeTxAuctionCancelMessage(req);
  //   const receiver = this.getAccount(BigInt(req.L2AddrReceiver));
  //   if(!receiver) {
  //     throw new Error(`Deposit account not found L2Addr=${req.L2AddrReceiver}`);
  //   }
    
  //   this.accountBeforeUpdate(receiver.L2Address, tokenAddrRefund);
  //   this.updateAccountToken(receiver.L2Address, tokenAddrRefund, BigInt(req.amount), -BigInt(req.amount));
  //   this.accountAfterUpdate(receiver.L2Address, tokenAddrRefund);

  //   this.orderBeforeUpdate(orderLeafId);
  //   await this.cancelAuctionOrder(req);
  //   this.orderAfterUpdate(orderLeafId);

  //   this.accountBeforeUpdate(receiver.L2Address, tokenAddrRefund);
  //   this.accountAfterUpdate(receiver.L2Address, tokenAddrRefund);



  //   const txTransferReq: TsTxTransferRequest = {
  //     L2AddrFrom: receiver.L2Address.toString(),
  //     L2AddrTo: '0',
  //     L2TokenAddr: tokenAddrRefund,
  //     amount: req.amount,
  //     nonce: req.nonce,
  //     txAmount: amountToTxAmountV2(BigInt(req.amount)).toString(),
  //     reqType: req.reqType,
  //     eddsaSig: {
  //       R8: ['0', '0'],
  //       S: '0'
  //     },
  //     L2TokenLeafIdFrom: receiver.getTokenLeaf(tokenAddrRefund).leafId.toString(),
  //   };

  //   const { r_chunks_bigint, o_chunks_bigint, isCriticalChunk } = this.getTxChunks(txTransferReq);

  //   const tx =  {
  //     reqData,
  //     tsPubKey: receiver.tsPubKey, // Deposit tx not need signature
  //     sigR: txTransferReq.eddsaSig.R8,
  //     sigS: txTransferReq.eddsaSig.S,

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
}

