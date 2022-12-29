import { TsMerkleTree } from '../merkle-tree-dp';
import { AuctionEngine } from '../ts-auction-engine';
import { TsRollupCircuitInputItemType, TsRollupCircuitInputType, TsRollupRegisterInputItemType } from '../ts-types/ts-circuit-types';
import { TsTxWithdrawRequest, TsTxTransferRequest, TsTxRegisterRequest, TsTxDepositNonSignatureRequest, TsTxAuctionLendRequest, TsTxAuctionBorrowRequest, TsTxAuctionCancelRequest, TsTxDepositRequest, ITxRequest } from '../ts-types/ts-req-types';
import { TsSystemAccountAddress, TsTokenAddress, TsTokenInfo, TsTxType } from '../ts-types/ts-types';
import { TsRollupAccount, TsRollupSigner } from './ts-account';
import { ITsAuctionOrder, TsAuctionLendOrder, TsAuctionEmptyOrder, TsAuctionBorrowOrder, maturityToTsl, tslToInfo } from './ts-auction-order';
import { RESERVED_ACCOUNTS } from './ts-env';
import { toTreeLeaf, tsHashFunc } from './ts-helper';
import { RollupTxTransfer, RollupTxRegister } from './ts-transaction';
import { exportTransferCircuitInput, getEmptyMainTx, getEmptyRegisterTx, txsToRollupCircuitInput } from './ts-tx-helper';

export type TsRollupConfigType = {
    normal_batch_height: number,
    register_batch_size: number,
    l2_acc_addr_size: number,
    l2_token_addr_size: number,
    token_tree_height: number,
    order_tree_height: number,
    isPendingRollup: boolean,

    auction_market_count: number,
    auction_lender_count: number,
    auction_borrower_count: number,
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
    normal_batch_height: 0,
    register_batch_size: 1,
    l2_acc_addr_size: 12,
    l2_token_addr_size: 8,
    token_tree_height: 8,
    order_tree_height: 24,
    isPendingRollup: false,
    auction_market_count: 1,
    auction_lender_count: 100,
    auction_borrower_count: 100,
  };
  get txNormalPerBatch() {
    return 2 ** this.config.normal_batch_height;
  }
  get txRegisterPerBatch() {
    return this.config.register_batch_size;
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
  private auctionOrderMap: {[k: number | string]: ITsAuctionOrder} = {};
  private auctionOrderTree!: TsMerkleTree;
  private currentAuctionOrderId = 1; // 0 is default empty order

  /** Block informatino */
  public blockNumber = 0n;
  public txId = 0n;
  private currentTxLogs: any[] = [];
  private currentAccountRootFlow: bigint[] = [];
  private currentAuctionOrderRootFlow: bigint[] = [];
  private blockLogs: Map<string, {
        logs: any[],
        accountRootFlow: bigint[]
        auctionOrderRootFlow: bigint[]
    }> = new Map();
  // TODO: add rollup circuit logs

  constructor(config: Partial<TsRollupConfigType>) {
    this.config = {...this.config, ...config};
        
    this.initAccountTree();
    this.initAuctionOrderTree();
  }

  private initAccountTree() {
    this.mkAccountTree = new TsMerkleTree(
      this.accountList.map(a => toTreeLeaf(a.encodeAccountLeaf())),
      this.config.l2_acc_addr_size, tsHashFunc
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
        [{
          tokenAddr: TsTokenAddress.Unknown,
          amount: 0n,
          lockAmt: 0n,
        }],
        this.config.token_tree_height,
        [0n, 0n],
      ));
    }

    // TODO: initial registered accounts from storage.
  }

  private initAuctionOrderTree() {
    const defaultLeaf = new TsAuctionEmptyOrder();
    this.auctionOrderMap[0] = defaultLeaf;
    this.auctionOrderTree = new TsMerkleTree(
      Object.entries(this.auctionOrderMap).sort((a, b) => Number(a[0]) - Number(b[0])).map((o) => o[1].encodeOrderLeaf()),
      this.config.order_tree_height,
      tsHashFunc,
      defaultLeaf.encodeOrderLeaf()
    );
  }

  /** Auction */
  getOrderMap() {
    return this.auctionOrderMap;
  }

  async addAuctionOrder(reqType: TsTxType, txId: bigint, req: TsTxAuctionLendRequest | TsTxAuctionBorrowRequest): Promise<number> {
    const time = Date.now();
    if(reqType === TsTxType.AUCTION_LEND) {
      const orderId = this.currentAuctionOrderId;
      const order = new TsAuctionLendOrder(orderId, txId, req as TsTxAuctionLendRequest, time);
      this.updateAccountToken(BigInt(req.L2AddrFrom), order.L2TokenAddrLending as TsTokenAddress, -order.lendingAmt, true);
      // TODO: wrap auctio order tree logic;
      const leaf = order.encodeOrderLeaf();
      this.auctionOrderMap[orderId] = order;
      this.auctionOrderTree.updateLeafNode(orderId, leaf);
      this.currentAuctionOrderId++;
      return orderId;
    } 
    if(reqType === TsTxType.AUCTION_BORROW) {
      const orderId = this.currentAuctionOrderId;
      const order = new TsAuctionBorrowOrder(orderId, txId, req as TsTxAuctionBorrowRequest, time);
      this.updateAccountToken(BigInt(req.L2AddrFrom), order.L2TokenAddrCollateral as TsTokenAddress, -order.collateralAmt, true);
      // TODO: wrap auctio order tree logic;
      const leaf = order.encodeOrderLeaf();
      this.auctionOrderMap[orderId] = order;
      this.auctionOrderTree.updateLeafNode(orderId, leaf);
      this.currentAuctionOrderId++;
      return orderId;
    }
    throw new Error(`Invalid auction reqType (${reqType})`);
  }

  async cancelAuctionOrder(reqType: TsTxType, req: TsTxAuctionCancelRequest): Promise<number> {
    if(reqType === TsTxType.AUCTION_CANCEL) {
      const _req = req as TsTxAuctionCancelRequest;
      const orderId = Number(_req.orderLeafId);
      const order = this.auctionOrderMap[orderId];
      if(!order) {
        throw new Error(`auction order id=${orderId} not found`);
      }
      // check all order parameter are same
      if(order.reqType === TsTxType.AUCTION_LEND) {
        const _order = order as TsAuctionLendOrder;
        if(
          _order.L2AddrFrom !== BigInt(_req.L2AddrTo)
          || _order.L2AddrTo !== String(_req.L2AddrFrom)
          || _order.L2TokenAddrLending !== _req.L2TokenAddrRefunded as TsTokenAddress
          || _order.lendingAmt !== BigInt(_req.amount)
        ) {
          console.error({
            _order,
            _req,
          });
          throw new Error(`auction lend order id=${orderId} parameter not match`);
        }
      }
      if(order.reqType === TsTxType.AUCTION_BORROW) {
        const _order = order as TsAuctionBorrowOrder;
        if(
          _order.L2AddrFrom !== BigInt(_req.L2AddrTo)
          || _order.L2AddrTo !== String(_req.L2AddrFrom)
          || _order.L2TokenAddrCollateral !== _req.L2TokenAddrRefunded as TsTokenAddress
          || _order.collateralAmt !== BigInt(_req.amount)
        ) {
          console.error({
            _order,
            _req,
          });
          throw new Error(`auction lend order id=${orderId} parameter not match`);
        }
      }
      this.updateAccountToken(BigInt(_req.L2AddrTo), _req.L2TokenAddrRefunded as TsTokenAddress, BigInt(_req.amount), true);
      const newOrder = new TsAuctionEmptyOrder();
      this.auctionOrderMap[orderId] = newOrder;
      this.auctionOrderTree.updateLeafNode(orderId, newOrder.encodeOrderLeaf());
      return orderId;
    }
    throw new Error(`Invalid auction reqType (${reqType})`);
  }

  /** Account */
  getAccount(accAddr: bigint): TsRollupAccount {
    const acc = this.accountList[Number(accAddr)];
    if(!acc) {
      throw new Error('Account not found');
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

  private updateAccountToken(accountId: bigint, tokenAddr: TsTokenAddress, tokenAmt: bigint, isAuction: boolean) {
    const acc = this.getAccount(accountId);
    debugger;
    const newTokenRoot = acc.updateToken(tokenAddr, tokenAmt, isAuction);
    this.mkAccountTree.updateLeafNode(
      Number(accountId),
      toTreeLeaf(acc.encodeAccountLeaf()),
    );
    return {
      newTokenRoot,
    };
  }

  /** Rollup trace */
  private addFirstRootFlow() {
    if(this.currentAccountRootFlow.length !== 0 
      || this.currentAuctionOrderRootFlow.length !== 0) {
      throw new Error('addFirstRootFlow must run on new block');
    }
    this.addAccountRootFlow();
    this.addOrderRootFlow();
  }

  private flushBlock(blocknumber: bigint) {
    if(this.blockLogs.has(blocknumber.toString())) {
      throw new Error(`Block ${blocknumber} already exist`);
    }
    const logs = {...this.currentTxLogs};
    const accountRootFlow = [...this.currentAccountRootFlow];
    const auctionOrderRootFlow = [...this.currentAuctionOrderRootFlow];
    this.blockNumber = blocknumber;
    this.currentAccountRootFlow = [];
    this.currentAuctionOrderRootFlow = [];
    this.currentTxLogs = [];

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
    this.currentAuctionOrderRootFlow.push(BigInt(this.auctionOrderTree.getRoot()));
  }

  private addTxLogs(detail: any) {
    this.currentTxLogs.push(detail);
  }

  /** Rollup Transaction */
  // TODO: refactor method to retrict RollupCircuitType
  async startRollup(callback: (that: RollupCore, blockNumber: bigint) => Promise<void>, rollupType: RollupCircuitType): Promise<{
    blockNumber: bigint,
    inputs?: TsRollupCircuitInputType,
  }> {
    const perBatch = rollupType === RollupCircuitType.Register ? this.txRegisterPerBatch : this.txNormalPerBatch;
    if(this.config.isPendingRollup) {
      // TODO: dangerous: need handle concurrent requests
      const newBlockNumber = this.blockNumber + 1n;
      this.addFirstRootFlow();
      await callback(this, newBlockNumber);
      this.flushBlock(newBlockNumber);
      return {
        blockNumber: newBlockNumber,
      };
    } else {
      if(this.rollupStatus === RollupStatus.Running) {
        throw new Error('Rollup is running');
      }
      this.rollupStatus = RollupStatus.Running;

      const newBlockNumber = this.blockNumber + 1n;
      this.addFirstRootFlow();
      // TODO: rollback state if callback failed
      await callback(this, newBlockNumber);
      if(this.currentTxLogs.length !== perBatch) {
        // TODO: handle empty transactions
        // throw new Error(`Rollup txNumbers=${this.currentTxLogs.length} not match txPerBatch=${perBatch}`);
        console.warn(`Rollup txNumbers=${this.currentTxLogs.length} not match txPerBatch=${perBatch}`);
        const emptyTxNum = perBatch - this.currentTxLogs.length;
        for(let i = 0; i < emptyTxNum; i++) {
          rollupType === RollupCircuitType.Register
            ? await this.doRegister(getEmptyRegisterTx())
            : await this.doDeposit(getEmptyMainTx());
        }
      } 

      const circuitInputs = exportTransferCircuitInput(this.currentTxLogs, this.txId, this.currentAccountRootFlow, this.currentAuctionOrderRootFlow);
      this.txId = this.txId + BigInt(this.currentTxLogs.length);
      this.flushBlock(newBlockNumber);
      this.rollupStatus = RollupStatus.Idle;

      return {
        blockNumber: newBlockNumber,
        inputs: circuitInputs,
      };
    }
  }
  private async _normalCircuit(reqType: TsTxType, txTransferReq: TsTxTransferRequest, args: string[], rawReq: {[k: string]: string}) {
    if(!txTransferReq.eddsaSig) {
      throw new Error('Signature is undefined');
    }
    const txId = this.txId + BigInt(this.currentTxLogs.length);
    const isAuction = reqType === TsTxType.AUCTION_LEND || reqType === TsTxType.AUCTION_BORROW || reqType === TsTxType.AUCTION_CANCEL;
    let orderLeafId = 0;
    switch (reqType) {
      case TsTxType.AUCTION_LEND:
      case TsTxType.AUCTION_BORROW:
        orderLeafId = this.currentAuctionOrderId;
        break;
      case TsTxType.AUCTION_CANCEL:
        orderLeafId = Number(args[0]);
        break;
      default:
        orderLeafId = 0;
        break;
    }

    const from = this.getAccount(BigInt(txTransferReq.L2AddrFrom));
    const to = this.getAccount(BigInt(txTransferReq.L2AddrTo));

    const txTransfer = new RollupTxTransfer(reqType, from, to, txTransferReq.L2TokenAddr, BigInt(txTransferReq.amount), BigInt(txTransferReq.nonce), args, txTransferReq.eddsaSig);
    const txBaseDatas = txTransfer.encodeCircuitInputData(isAuction);        

    // UpdateState Procedures:
    // 1. Extract Sender merkle proof
    const accountMerkleProofFrom = this.getAccountProof(txBaseDatas.txL2AddrFrom);
    const oriTokenRootFrom = from.getTokenRoot();
    const tokenMerkleProofFrom = from.tokenTree.getProof(from.getTokenLeafId(txBaseDatas.txL2TokenAddr));
    const oriOrderLeaf = this.auctionOrderTree.getLeaf(orderLeafId);
    const orderMerkleProofTo = this.auctionOrderTree.getProof(orderLeafId);

    // 2. update sender Leaf
    let newTokenRootFrom: string;
    if(from.isNormalAccount) {
      from.updateNonce(txBaseDatas.newNonceFrom);
      if(isAuction && reqType !== TsTxType.AUCTION_CANCEL) {
        await this.addAuctionOrder(reqType, txId, rawReq as unknown as TsTxAuctionLendRequest | TsTxAuctionBorrowRequest);
      } else {
        this.updateAccountToken(txBaseDatas.txL2AddrFrom, txBaseDatas.oriL2TokenAddrFrom as TsTokenAddress, -txBaseDatas.txAmount, false);
      }
      newTokenRootFrom = from.getTokenRoot();
    } else {
      newTokenRootFrom = oriTokenRootFrom;
    }
        
    // 3. add RootFlow
    this.addAccountRootFlow();

    // 4. Extract receiver merkle proof
    const accountMerkleProofTo = this.getAccountProof(txTransfer.txL2AddrTo);
    const oriTokenRootTo = to.getTokenRoot();
    const tokenMerkleProofTo = to.tokenTree.getProof(to.getTokenLeafId(txBaseDatas.txL2TokenAddr));

    // 5. update receiver Leaf
    let newTokenRootTo: string;
    if(to.isNormalAccount) {
      if(isAuction && reqType === TsTxType.AUCTION_CANCEL) {
        await this.cancelAuctionOrder(reqType, rawReq as unknown as TsTxAuctionCancelRequest);
      } else {
        this.updateAccountToken(txBaseDatas.txL2AddrTo, txBaseDatas.newL2TokenAddrTo as TsTokenAddress, txBaseDatas.txAmount, false);
      }
      newTokenRootTo = to.getTokenRoot();
    } else {
      newTokenRootTo = oriTokenRootTo;
    }
        
    // 6. add RootFlow
    this.addAccountRootFlow();
    this.addOrderRootFlow();

    const tx = {
      ...txBaseDatas,
      oriTokenRootFrom,
      oriTokenRootTo,
      newTokenRootFrom,
      newTokenRootTo,

      accountMerkleProofFrom,
      accountMerkleProofTo,
      tokenMerkleProofFrom,
      tokenMerkleProofTo,

      orderLeafId,
      oriOrderLeaf,
      orderMerkleProofTo,
      // accountRootFlow,
      // orderRootFlow,
    };
    this.addTxLogs(tx);

    return tx as unknown as TsRollupCircuitInputItemType;
  }

  async doTransaction(req: ITxRequest) {
    switch (req.reqType) {
      case TsTxType.REGISTER:
        return this.doRegister(req as TsTxRegisterRequest);
      case TsTxType.DEPOSIT:
        return this.doDeposit(req as TsTxDepositRequest);
      case TsTxType.TRANSFER:
        return this.doTransfer(req as TsTxTransferRequest);
      case TsTxType.WITHDRAW:
        return this.doWithdraw(req as TsTxWithdrawRequest);
      case TsTxType.AUCTION_LEND:
        return this.doAuctionLend(req as TsTxAuctionLendRequest);
      case TsTxType.AUCTION_BORROW:
        return this.doAuctionBorrow(req as TsTxAuctionBorrowRequest);
      case TsTxType.AUCTION_CANCEL:
        return this.doAuctionCancel(req as TsTxAuctionCancelRequest);
      case TsTxType.UNKNOWN:
      default:
        throw new Error(`Unknown request type reqType=${req.reqType}`);
        break;
    }
  }

  private async doDeposit(req: TsTxDepositNonSignatureRequest) {
    // TODO: valid toAddr have not been added in AccountTree;
    const mintSinger = new TsRollupSigner(Buffer.from('0x00'));
    const txTransferReq = mintSinger.prepareTxDeposit(BigInt(req.L2AddrTo), req.L2TokenAddr, BigInt(req.amount));

    return await this._normalCircuit(TsTxType.DEPOSIT, txTransferReq as TsTxTransferRequest, [], req as any);
  }

  private async doWithdraw(req: TsTxWithdrawRequest) {
    const txTransferReq: TsTxTransferRequest = {
      reqType: TsTxType.WITHDRAW,
      L2AddrFrom: req.L2AddrFrom,
      L2AddrTo: TsSystemAccountAddress.WITHDRAW_ADDR,
      L2TokenAddr: req.L2TokenAddr,
      amount: req.amount,
      nonce: req.nonce,
      eddsaSig: req.eddsaSig,
    };
    return await this._normalCircuit(TsTxType.WITHDRAW, txTransferReq, [], req as any);
  }

  private async doAuctionLend(req: TsTxAuctionLendRequest) {
    const txTransferReq: TsTxTransferRequest = {
      reqType: TsTxType.AUCTION_LEND,
      L2AddrFrom: req.L2AddrFrom,
      L2AddrTo: TsSystemAccountAddress.AUCTION_ADDR,
      L2TokenAddr: req.L2TokenAddrLending,
      amount: req.lendingAmt,
      nonce: req.nonce,
      eddsaSig: req.eddsaSig,
    };
    const txTransferLog = await this._normalCircuit(
      TsTxType.AUCTION_LEND, txTransferReq, 
      [
        req.maturityDate,
        req.expiredTime,
        req.interest,
      ], req as any);

    return txTransferLog;
  }

  private async doAuctionBorrow(req: TsTxAuctionBorrowRequest) {
    const txTransferReq: TsTxTransferRequest = {
      reqType: TsTxType.AUCTION_BORROW,
      L2AddrFrom: req.L2AddrFrom,
      L2AddrTo: TsSystemAccountAddress.AUCTION_ADDR,
      L2TokenAddr: req.L2TokenAddrCollateral,
      amount: req.collateralAmt,
      nonce: req.nonce,
      eddsaSig: req.eddsaSig,
    };
    const txTransferLog = await this._normalCircuit(
      TsTxType.AUCTION_BORROW, txTransferReq, 
      [
        req.maturityDate,
        req.expiredTime,
        req.interest,
        req.L2TokenAddrBorrowing,
        req.borrowingAmt
      ], req as any);
    return txTransferLog;
  }

  private async doAuctionCancel(req: TsTxAuctionCancelRequest) {
    const txTransferReq: TsTxTransferRequest = {
      reqType: TsTxType.AUCTION_CANCEL,
      L2AddrFrom: TsSystemAccountAddress.AUCTION_ADDR,
      L2AddrTo: req.L2AddrTo,
      L2TokenAddr: req.L2TokenAddrRefunded,
      amount: req.amount,
      nonce: req.nonce,
      eddsaSig: req.eddsaSig,
    };

    // TODO: [Optimize] args encode move to TsTxAuctionBorrowRequest
    const txTransferLog = await this._normalCircuit(
      TsTxType.AUCTION_CANCEL, txTransferReq, 
      [
        req.orderLeafId,
      ], req as any);
    return txTransferLog;
  }

  private async doTransfer(txTransferReq: TsTxTransferRequest) {
    return await this._normalCircuit(TsTxType.TRANSFER, txTransferReq, [], txTransferReq as any);
  }

  private async doRegister(req: TsTxRegisterRequest) {
    // UpdateState Procedures:
    const tokenInfos: TsTokenInfo[] = req.L2TokenAddr !== TsTokenAddress.Unknown && Number(req.amount) > 0
      ? [{
        tokenAddr: req.L2TokenAddr as TsTokenAddress,
        amount: BigInt(req.amount),
        lockAmt: 0n,
      }]
      : [];
    const account = new TsRollupAccount(
      tokenInfos,
      this.config.token_tree_height,
      [BigInt(req.tsPubKey[0]), BigInt(req.tsPubKey[1])],
    );
    const accAddr = this.addAccount(Number(req.L2AddrFrom), account);

    const txRegister = new RollupTxRegister(
      BigInt(accAddr),
      account.tsPubKey,
      req.L2TokenAddr ?? TsTokenAddress.Unknown,
      BigInt(req.amount ?? 0),
    );
    const txBaseDatas = txRegister.encodeCircuitInputData();
    const accountMerkleProof = this.mkAccountTree.getProof(accAddr);
    const tx = {
      ...txBaseDatas,
      accountMerkleProof,
    };
    this.addTxLogs(tx);
    this.addAccountRootFlow();

    return tx as TsRollupRegisterInputItemType;
  }

  /** Auction Match */
  public async startMatchRollup() {
    // const market_count = this.config.auction_market_count;
    // const lender_count = this.config.auction_result_count;
    // const borrower_count = this.config.auction_borrower_count;

    /** gen order map */
    const ordersMap = this.getOrderMap();
    const orderIds = Object.keys(ordersMap);
    const defaultOrder = this.auctionOrderMap[0];
    const groupByUnderlying: {[key: string|number]: ITsAuctionOrder[]} = {};
    for (let index = 0; index < orderIds.length; index++) {
      const orderId = orderIds[index];
      const order = ordersMap[orderId];
      if(order.L2TokenAddrLending === TsTokenAddress.Unknown) {
        continue;
      }
      const tslToken = maturityToTsl(order.L2TokenAddrLending, order.maturityDate);
      
      if(!groupByUnderlying[tslToken]) {
        groupByUnderlying[tslToken] = [];
      }
      groupByUnderlying[tslToken].push(order);
    }

    /** by market parse matching */
    const resultList = [];
    const underlyings = Object.keys(groupByUnderlying);
    for (let index = 0; index < underlyings.length; index++) {
      this.addAccountRootFlow();
      this.addOrderRootFlow();
      const tslToken = underlyings[index] as TsTokenAddress;
      const {underlying: underlyingToken, maturityDate} = tslToInfo(tslToken);
      const orders = groupByUnderlying[tslToken];
      const rLendOrders = orders.filter(order => order.reqType === TsTxType.AUCTION_LEND);
      const rBorrorOrders = orders.filter(order => order.reqType === TsTxType.AUCTION_BORROW);
      for (let index = rLendOrders.length; index < this.config.auction_lender_count; index++) {
        rLendOrders.push(defaultOrder);
      }
      for (let index = rBorrorOrders.length; index < this.config.auction_borrower_count; index++) {
        rBorrorOrders.push(defaultOrder);
      }

      const engine = new AuctionEngine();
      orders.forEach((item) => {
        if(item.reqType !== TsTxType.UNKNOWN) {
          engine.addOrder(item.orderId, item);
        }
      });
      const { matchedLendOrders, matchedBorrowOrders } = engine.doMatchAuctionOrders();

      // console.log({
      //   mi: matchedLendOrders.map(item => item.matchedInterestRate),
      //   mb: matchedBorrowOrders.map(item => item.matchedInterestRate),
      // });
      const matchedTime = Math.round(Date.now() / ( 1000 * 60 * 60)); // hours
      const currentDate = Math.floor(matchedTime / 24);
      const currentDateMod = matchedTime % 24;
      const power = maturityDate - BigInt(currentDate);

      const inputs = {
        matchedTime,
        l2AddrLender: rLendOrders.map(order => order.L2AddrFrom),
        l2AddrBorrower: rBorrorOrders.map(order => order.L2AddrFrom),
        
        // AccTree
        matchedLendingAmt: rLendOrders.map(order => matchedLendOrders.find(mOrder => mOrder.id === order.orderId)?.matchedAmount ?? 0n),
        l2TokenAddrLending: underlyingToken,
        maturityDate,
        l2TokenAddrTsl: tslToken,
        tokenLeafIdLending: rLendOrders.map(order => this.getAccount(order.L2AddrFrom).getTokenLeafId(underlyingToken) ),
        tokenLeafIdtTsl: rLendOrders.map(order => this.getAccount(order.L2AddrFrom).getTokenLeafId(tslToken) ),
        matchedCollateral: rBorrorOrders.map(order => matchedBorrowOrders.find(mOrder => mOrder.id === order.orderId) ? order.collateralAmt : 0n),
        matchedBorrowingAmt: rBorrorOrders.map(order => matchedBorrowOrders.find(mOrder => mOrder.id === order.orderId)?.matchedAmount ?? 0n),
        l2TokenAddrCollateral: rBorrorOrders.map(order => order.L2TokenAddrCollateral),
        tokenLeafIdCollateral: rBorrorOrders.map(order => this.getAccount(order.L2AddrFrom).getTokenLeafId(order.L2TokenAddrCollateral) ),
        tokenLeafIdBorrowing: rBorrorOrders.map(order => this.getAccount(order.L2AddrFrom).getTokenLeafId(underlyingToken) ),

        // accountRootFlow
        // orderRootFlow

        // AccountPrfLender
        tsPubKeyLender: rLendOrders.map(order => this.getAccount(order.L2AddrFrom).tsPubKey),
        NonceLender: rLendOrders.map(order => this.getAccount(order.L2AddrFrom).nonce),
        tokenRootFlowLender: rLendOrders.map(order => 
        /** total length = 3 */
          [ this.getAccount(order.L2AddrFrom).getTokenRoot(), '', '' ]
        ),
        accountMerkleProofLender: rLendOrders.map(order => this.getAccountProof(order.L2AddrFrom)),

        // TokenPrfLending
        oriAmountLending: rLendOrders.map(order => this.getAccount(order.L2AddrFrom).getTokenAmount(order.L2TokenAddrLending)),
        oriLockedAmountLending: rLendOrders.map(order => this.getAccount(order.L2AddrFrom).getTokenLockedAmount(order.L2TokenAddrLending)),
        tokenMerkleProofLending: rLendOrders.map(order => this.getAccount(order.L2AddrFrom).getTokenProof(order.L2TokenAddrLending)),

        // TokenPrfTsl
        oriL2TokenAddrTsl: rLendOrders.map(order => this.getAccount(order.L2AddrFrom).getTokenAmount(tslToken)),
        oriAmountTsl: rLendOrders.map(order => this.getAccount(order.L2AddrFrom).getTokenAmount(tslToken)),
        oriLockedAmountTsl: rLendOrders.map(order => this.getAccount(order.L2AddrFrom).getTokenLockedAmount(tslToken)),
        tokenMerkleProofTsl: rLendOrders.map(order => this.getAccount(order.L2AddrFrom).getTokenProof(tslToken)),

        // AccountPrfBorrower
        tsPubKeyBorrower: rBorrorOrders.map(order => this.getAccount(order.L2AddrFrom).tsPubKey),
        NonceBorrower: rBorrorOrders.map(order => this.getAccount(order.L2AddrFrom).nonce),
        tokenRootFlowBorrower: rBorrorOrders.map(order =>
        /** total length = 3 */
          [ this.getAccount(order.L2AddrFrom).getTokenRoot(), '', '' ]
        ),
        accountMerkleProofBorrower: rBorrorOrders.map(order => this.getAccountProof(order.L2AddrFrom)),

        //TokenPrfCollateral
        oriAmountCollateral: rBorrorOrders.map(order => this.getAccount(order.L2AddrFrom).getTokenAmount(order.L2TokenAddrCollateral)),
        oriLockedAmountCollateral: rBorrorOrders.map(order => this.getAccount(order.L2AddrFrom).getTokenLockedAmount(order.L2TokenAddrCollateral)),
        tokenMerkleProofCollateral: rBorrorOrders.map(order => this.getAccount(order.L2AddrFrom).getTokenProof(order.L2TokenAddrCollateral)),

        // TokenPrfBorrowing
        oriL2TokenAddrBorrowing: rBorrorOrders.map(order => this.getAccount(order.L2AddrFrom).getTokenAmount(order.L2TokenAddrLending)),
        oriAmountBorrowing: rBorrorOrders.map(order => this.getAccount(order.L2AddrFrom).getTokenAmount(order.L2TokenAddrLending)),
        oriLockedAmountBorrowing: rBorrorOrders.map(order => this.getAccount(order.L2AddrFrom).getTokenLockedAmount(order.L2TokenAddrLending)),
        tokenMerkleProofBorrowing: rBorrorOrders.map(order => this.getAccount(order.L2AddrFrom).getTokenProof(order.L2TokenAddrLending)),

        //OrderPrf
        reqDatasLender: rLendOrders.map(order => order.encode().slice(1)),
        orderLeafIdLender: rLendOrders.map(order => order.orderId),
        orderMerkleProofLender: rLendOrders.map(order => this.auctionOrderTree.getProof(order.orderId)),

        reqDatasBorrower: rBorrorOrders.map(order => order.encode().slice(1)),
        orderLeafIdBorrower: rBorrorOrders.map(order => order.orderId),
        orderMerkleProofBorrower: rBorrorOrders.map(order => this.auctionOrderTree.getProof(order.orderId)),
      };

      // TODO:
      for (let index = 0; index < matchedLendOrders.length; index++) {
        const mOrder = matchedLendOrders[index];
        const order = this.auctionOrderMap[mOrder.id];

        const lender = this.getAccount(order.L2AddrFrom);
        // 1. remove LockedAmt from lender
        lender.updateTokenNew(order.L2TokenAddrLending, 0n, -mOrder.matchedAmount);
        // 2. add TslToken to lender
        const interest = mOrder.matchedAmount ** (power / 365n);
        lender.updateTokenNew(tslToken, mOrder.matchedAmount + interest, 0n);

        // 3. update order from order tree (amount)
        // this.updateAccountToken(BigInt(_req.L2AddrTo), _req.L2TokenAddrRefunded as TsTokenAddress, BigInt(_req.amount), true);
        // const newOrder = new TsAuctionEmptyOrder();
        // this.auctionOrderMap[orderId] = newOrder;
        // this.auctionOrderTree.updateLeafNode(orderId, newOrder.encodeOrderLeaf());
        
      }

    

      // accountRootFlow
      // orderRootFlow
      // tokenRootFlowLender
      // tokenRootFlowBorrower
      
      resultList.push({inputs, matchedLendOrders, matchedBorrowOrders});
    }
    
    
    const inputs = resultList.map(item => item.inputs);
    const circuitInputs = txsToRollupCircuitInput(inputs);
    return {resultList, circuitInputs};
  }
}
