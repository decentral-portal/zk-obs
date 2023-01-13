import { poseidon } from '@big-whale-labs/poseidon';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { BigNumber, Contract, Signer } from 'ethers';
import { ethers } from 'hardhat';
import { WETH9 } from '../typechain-types';
import { ERC20FreeMint } from '../typechain-types';
import { Operations, ZkOBS } from '../typechain-types/contracts/ZkOBS';
import { deploy, genTsAddr, initTestData } from './utils';
import {
  amountToTxAmountV3_40bit,
  getRollupData,
  stateToCommitment,
} from './helper/helper';
import fs from 'fs';

const initStates = JSON.parse(
  fs.readFileSync('./test/demo/initStates.json', 'utf-8'),
);
const BaseDir = './test/demo';

describe('Unit test of rollup', function () {
  enum OpType {
    UNKNOWN,
    REGISTER,
    DEPOSIT,
    TRANSFER,
    WITHDRAW,
    AUCTION_LEND,
    AUCTION_BORROW,
    CANCEL_ORDER,
    SET_EPOCH,
    AUCTION_START,
    AUCTION_MATCH,
    AUCTION_END,
    SECOND_LIMIT_ORDER,
    SECOND_LIMIT_START,
    SECOND_LIMIT_EXCHANGE,
    SECOND_LIMIT_END,
    SECOND_MARKET_ORDER,
    SECOND_MARKET_EXCHANGE,
    SECOND_MARKET_END,
  }

  let operator: Signer;
  let user1: Signer;
  let user2: Signer;
  let zkUSDC: ERC20FreeMint;
  let zkOBS: ZkOBS;
  let wETH: WETH9;
  let lastCommittedBlock: ZkOBS.StoredBlockStruct;
  let commitBlock: ZkOBS.CommitBlockStruct;

  const CALLDATA_CHUNK = 50;
  

  before(async function () {
    const {
      operator: _operator,
      user1: _user1,
      user2: _user2,
      zkUSDC: _zkUSDC,
      wETH: _wETH,
      zkOBS: _zkOBS,
    } = await loadFixture(deploy);
    operator = _operator;
    user1 = _user1;
    user2 = _user2;
    zkUSDC = _zkUSDC;
    zkOBS = _zkOBS;
    wETH = _wETH;
    // whitelist token
    await zkOBS.connect(operator).addToken(zkUSDC.address);
  });

  describe('Rollup for single register with USDC', function () {
    const data = initTestData(BaseDir);
    let testIndex = 0;
    let {
      pubKeyX,
      pubKeyY,
      amount,
      oriStateRoot,
      newStateRoot,
      newTsRoot,
      commitmentHashOrigin,
      o_chunk,
      pubdataOffset,
      proof_a,
      proof_b,
      proof_c,
      proof_commitment,
    } = getRollupData(
      data[testIndex].inputs,
      data[testIndex].commitmentData,
      data[testIndex].callData,
    );

    it('User register with USDC', async function () {
      amount = BigNumber.from(data[testIndex + 1].inputs.reqData[0][3]);
      // get user's states first
      const oriBalance: BigNumber = await zkUSDC.balanceOf(zkOBS.address);
      const oriAccountNum = await zkOBS.accountNum();
      const oriTotalPendingRequests = await zkOBS.pendingL1RequestNum();

      // call deposit
      zkUSDC.connect(user1).mint(amount);

      await zkUSDC.connect(user1).approve(zkOBS.address, amount);
      await zkOBS
        .connect(user1)
        .registerERC20(pubKeyX, pubKeyY, zkUSDC.address, amount);
      // check user balance
      const newBalance: BigNumber = await zkUSDC.balanceOf(zkOBS.address);
      expect(newBalance.sub(oriBalance)).to.be.eq(amount);

      // check accountNum increased
      const newAccountNum = await zkOBS.accountNum();
      expect(newAccountNum - oriAccountNum).to.be.eq(1);

      // check totalPendingRequest increased
      const newTotalPendingRequests = await zkOBS.pendingL1RequestNum();
      expect(newTotalPendingRequests.sub(oriTotalPendingRequests)).to.be.eq(2);
      // check the request is existed in the L1 request queue
      const firstL1RequestId = await zkOBS.firstL1RequestId();
      const totalPendingL1Requests = await zkOBS.pendingL1RequestNum();
      const accountId = await zkOBS.accountIdOf(await user1.getAddress());
      const tokenId = await zkOBS.tokenIdOf(zkUSDC.address);
      const l2Addr = genTsAddr(pubKeyX, pubKeyY);
      const register: Operations.RegisterStruct = {
        accountId: accountId,
        l2Addr: l2Addr,
      };

      let requestId = firstL1RequestId.add(totalPendingL1Requests).sub(2);
      let success = await zkOBS.checkRegisterL1Request(register, requestId);
      expect(success).to.be.true;

      const deposit: Operations.DepositStruct = {
        accountId: accountId,
        tokenId: tokenId,
        amount: amount,
      };
      requestId = firstL1RequestId.add(totalPendingL1Requests).sub(1);
      success = await zkOBS.checkDepositL1Request(deposit, requestId);
      expect(success).to.be.true;
    });

    it('Commit single register with USDC - 1', async function () {
      zkOBS = zkOBS.connect(operator);

      lastCommittedBlock = {
        blockNumber: BigNumber.from('0'),
        stateRoot: initStates.stateRoot,
        l1RequestNum: BigNumber.from('0'),
        pendingRollupTxHash: emptyHash,
        commitment: ethers.utils.defaultAbiCoder.encode(
          ['bytes32'],
          [String('0x').padEnd(66, '0')],
        ),
        timestamp: BigNumber.from('0'),
      };

      const newBlocks: ZkOBS.CommitBlockStruct[] = [];
      commitBlock = {
        blockNumber: BigNumber.from(lastCommittedBlock.blockNumber).add(1),
        newStateRoot: newStateRoot,
        newTsRoot: newTsRoot,
        publicData: o_chunk,
        publicDataOffsets: pubdataOffset,
        timestamp: Date.now(),
      };

      newBlocks.push(commitBlock);
      const oriTotalCommittedBlocks = await zkOBS.committedBlockNum();
      const oriTotalCommittedL1Requests = await zkOBS.committedL1RequestNum();
      await zkOBS.commitBlocks(lastCommittedBlock, newBlocks);
      const newTotalCommittedBlocks = await zkOBS.committedBlockNum();
      const newTotalCommittedL1Requests = await zkOBS.committedL1RequestNum();
      expect(newTotalCommittedBlocks - oriTotalCommittedBlocks).to.be.eq(
        newBlocks.length,
      );
      expect(
        newTotalCommittedL1Requests.sub(oriTotalCommittedL1Requests),
      ).to.be.eq(1);
    });

    it('Prove single register with USDC - 1', async function () {
      // prove blocks
      const oriTotalProvedBlocks = await zkOBS.provedBlockNum();

      const committedBlocks: ZkOBS.StoredBlockStruct[] = [];
      const commitedBlock: ZkOBS.StoredBlockStruct = {
        blockNumber: commitBlock.blockNumber,
        stateRoot: commitBlock.newStateRoot,
        l1RequestNum: 1,
        pendingRollupTxHash: emptyHash,
        commitment: commitmentHashOrigin,
        timestamp: commitBlock.timestamp,
      };
      lastCommittedBlock = commitedBlock;
      committedBlocks.push(commitedBlock);
      const proofs: ZkOBS.ProofStruct[] = [];
      const proof: ZkOBS.ProofStruct = {
        a: [proof_a[0], proof_a[1]],
        b: [
          [proof_b[0][0], proof_b[0][1]],
          [proof_b[1][0], proof_b[1][1]],
        ],
        c: [proof_c[0], proof_c[1]],
        commitment: [proof_commitment[0]],
      };
      proofs.push(proof);

      await zkOBS.proveBlocks(committedBlocks, proofs);

      const newTotalProvedBlocks = await zkOBS.provedBlockNum();
      expect(newTotalProvedBlocks - oriTotalProvedBlocks).to.be.eq(
        committedBlocks.length,
      );
    });

    it('Execute single register with USDC - 1', async function () {
      // execute blocks
      const oriTotalExecutedBlocks = await zkOBS.executedBlockNum();
      const oriFirstL1RequestId = await zkOBS.firstL1RequestId();
      const oriTotalCommittedL1Requests = await zkOBS.committedL1RequestNum();
      const oriTotalPendingL1Requests = await zkOBS.pendingL1RequestNum();
      let pendingBlocks: ZkOBS.ExecuteBlockStruct[];
      let pendingRollupTxPubdata: any[] = [];
      const executeBlock: ZkOBS.ExecuteBlockStruct = {
        storedBlock: lastCommittedBlock,
        pendingRollupTxPubdata: pendingRollupTxPubdata,
      };
      pendingBlocks = [executeBlock];
      await zkOBS.executeBlocks(pendingBlocks);
      const newTotalExecutedBlocks = await zkOBS.executedBlockNum();
      const newFirstL1RequestId = await zkOBS.firstL1RequestId();
      const newTotalCommittedL1Requests = await zkOBS.committedL1RequestNum();
      const newTotalPendingL1Requests = await zkOBS.pendingL1RequestNum();

      expect(newTotalExecutedBlocks - oriTotalExecutedBlocks).to.be.eq(
        pendingBlocks.length,
      );
      let totalL1Requests = BigNumber.from(`0`);
      for (let i = 0; i < pendingBlocks.length; i++) {
        totalL1Requests = totalL1Requests.add(
          pendingBlocks[i].storedBlock.l1RequestNum,
        );
      }
      expect(newFirstL1RequestId.sub(oriFirstL1RequestId)).to.be.eq(
        totalL1Requests,
      );
      expect(
        oriTotalCommittedL1Requests.sub(newTotalCommittedL1Requests),
      ).to.be.eq(totalL1Requests);
      expect(oriTotalPendingL1Requests.sub(newTotalPendingL1Requests)).to.be.eq(
        totalL1Requests,
      );
    });

    it('Commit single register with USDC - 2', async function () {
      let testIndex = 1;
      let {
        pubKeyX,
        pubKeyY,
        amount,
        oriStateRoot,
        newStateRoot,
        newTsRoot,
        commitmentHashOrigin,
        o_chunk,
        pubdataOffset,
        proof_a,
        proof_b,
        proof_c,
        proof_commitment,
      } = getRollupData(
        data[testIndex].inputs,
        data[testIndex].commitmentData,
        data[testIndex].callData,
      );
      zkOBS = zkOBS.connect(operator);

      const newBlocks: ZkOBS.CommitBlockStruct[] = [];
      commitBlock = {
        blockNumber: BigNumber.from(lastCommittedBlock.blockNumber).add(1),
        newStateRoot: newStateRoot,
        newTsRoot: newTsRoot,
        publicData: o_chunk,
        publicDataOffsets: pubdataOffset,
        timestamp: Date.now(),
      };

      newBlocks.push(commitBlock);
      const oriTotalCommittedBlocks = await zkOBS.committedBlockNum();
      const oriTotalCommittedL1Requests = await zkOBS.committedL1RequestNum();
      await zkOBS.commitBlocks(lastCommittedBlock, newBlocks);
      const newTotalCommittedBlocks = await zkOBS.committedBlockNum();
      const newTotalCommittedL1Requests = await zkOBS.committedL1RequestNum();
      expect(newTotalCommittedBlocks - oriTotalCommittedBlocks).to.be.eq(
        newBlocks.length,
      );
      expect(
        newTotalCommittedL1Requests.sub(oriTotalCommittedL1Requests),
      ).to.be.eq(1);
    });

    it('Prove single register with USDC - 2', async function () {
      let testIndex = 1;
      let {
        pubKeyX,
        pubKeyY,
        amount,
        oriStateRoot,
        newStateRoot,
        newTsRoot,
        commitmentHashOrigin,
        o_chunk,
        pubdataOffset,
        proof_a,
        proof_b,
        proof_c,
        proof_commitment,
      } = getRollupData(
        data[testIndex].inputs,
        data[testIndex].commitmentData,
        data[testIndex].callData,
      );
      // prove blocks
      const oriTotalProvedBlocks = await zkOBS.provedBlockNum();

      const committedBlocks: ZkOBS.StoredBlockStruct[] = [];
      const commitedBlock: ZkOBS.StoredBlockStruct = {
        blockNumber: commitBlock.blockNumber,
        stateRoot: commitBlock.newStateRoot,
        l1RequestNum: 1,
        pendingRollupTxHash: emptyHash,
        commitment: commitmentHashOrigin,
        timestamp: commitBlock.timestamp,
      };
      lastCommittedBlock = commitedBlock;
      committedBlocks.push(commitedBlock);
      const proofs: ZkOBS.ProofStruct[] = [];
      const proof: ZkOBS.ProofStruct = {
        a: [proof_a[0], proof_a[1]],
        b: [
          [proof_b[0][0], proof_b[0][1]],
          [proof_b[1][0], proof_b[1][1]],
        ],
        c: [proof_c[0], proof_c[1]],
        commitment: [proof_commitment[0]],
      };
      proofs.push(proof);

      await zkOBS.proveBlocks(committedBlocks, proofs);

      const newTotalProvedBlocks = await zkOBS.provedBlockNum();
      expect(newTotalProvedBlocks - oriTotalProvedBlocks).to.be.eq(
        committedBlocks.length,
      );
    });

    it('Execute single register with USDC - 2', async function () {
      let testIndex = 1;
      let {
        pubKeyX,
        pubKeyY,
        amount,
        oriStateRoot,
        newStateRoot,
        newTsRoot,
        commitmentHashOrigin,
        o_chunk,
        pubdataOffset,
        proof_a,
        proof_b,
        proof_c,
        proof_commitment,
      } = getRollupData(
        data[testIndex].inputs,
        data[testIndex].commitmentData,
        data[testIndex].callData,
      );
      // execute blocks
      const oriTotalExecutedBlocks = await zkOBS.executedBlockNum();
      const oriFirstL1RequestId = await zkOBS.firstL1RequestId();
      const oriTotalCommittedL1Requests = await zkOBS.committedL1RequestNum();
      const oriTotalPendingL1Requests = await zkOBS.pendingL1RequestNum();
      let pendingBlocks: ZkOBS.ExecuteBlockStruct[];
      let pendingRollupTxPubdata: any[] = [];
      const executeBlock: ZkOBS.ExecuteBlockStruct = {
        storedBlock: lastCommittedBlock,
        pendingRollupTxPubdata: pendingRollupTxPubdata,
      };
      pendingBlocks = [executeBlock];
      await zkOBS.executeBlocks(pendingBlocks);
      const newTotalExecutedBlocks = await zkOBS.executedBlockNum();
      const newFirstL1RequestId = await zkOBS.firstL1RequestId();
      const newTotalCommittedL1Requests = await zkOBS.committedL1RequestNum();
      const newTotalPendingL1Requests = await zkOBS.pendingL1RequestNum();

      expect(newTotalExecutedBlocks - oriTotalExecutedBlocks).to.be.eq(
        pendingBlocks.length,
      );
      let totalL1Requests = BigNumber.from(`0`);
      for (let i = 0; i < pendingBlocks.length; i++) {
        totalL1Requests = totalL1Requests.add(
          pendingBlocks[i].storedBlock.l1RequestNum,
        );
      }
      expect(newFirstL1RequestId.sub(oriFirstL1RequestId)).to.be.eq(
        totalL1Requests,
      );
      expect(
        oriTotalCommittedL1Requests.sub(newTotalCommittedL1Requests),
      ).to.be.eq(totalL1Requests);
      expect(oriTotalPendingL1Requests.sub(newTotalPendingL1Requests)).to.be.eq(
        totalL1Requests,
      );
    });
  });

  describe('Rollup for single register with ETH', function () {
    const data = initTestData(BaseDir);
    const testIndex = 2;
    const {
      pubKeyX,
      pubKeyY,
      amount,
      oriStateRoot,
      newStateRoot,
      newTsRoot,
      commitmentHashOrigin,
      o_chunk,
      pubdataOffset,
      proof_a,
      proof_b,
      proof_c,
      proof_commitment,
    } = getRollupData(
      data[testIndex].inputs,
      data[testIndex].commitmentData,
      data[testIndex].callData,
    );

    it('User register with ETH', async function () {
      const amount = BigNumber.from(data[testIndex + 1].inputs.reqData[0][3]);
      // get user's states first
      const oriBalance: BigNumber = await wETH.balanceOf(zkOBS.address);
      const oriAccountNum = await zkOBS.accountNum();
      const oriTotalPendingRequests = await zkOBS.pendingL1RequestNum();

      // call deposit
      await zkOBS
        .connect(user2)
        .registerETH(pubKeyX, pubKeyY, { value: amount });
      // check user balance
      const newBalance: BigNumber = await wETH.balanceOf(zkOBS.address);
      expect(newBalance.sub(oriBalance)).to.be.eq(amount);

      // check accountNum increased
      const newAccountNum = await zkOBS.accountNum();
      expect(newAccountNum - oriAccountNum).to.be.eq(1);

      // check totalPendingRequest increased
      const newTotalPendingRequests = await zkOBS.pendingL1RequestNum();
      expect(newTotalPendingRequests.sub(oriTotalPendingRequests)).to.be.eq(2);

      // check the request is existed in the L1 request queue
      const firstL1RequestId = await zkOBS.firstL1RequestId();
      const totalPendingL1Requests = await zkOBS.pendingL1RequestNum();
      const accountId = await zkOBS.accountIdOf(await user2.getAddress());
      const tokenId = await zkOBS.tokenIdOf(wETH.address);
      const l2Addr = genTsAddr(pubKeyX, pubKeyY);
      const register: Operations.RegisterStruct = {
        accountId: accountId,
        l2Addr: l2Addr,
      };

      let requestId = firstL1RequestId.add(totalPendingL1Requests).sub(2);
      let success = await zkOBS.checkRegisterL1Request(register, requestId);
      expect(success).to.be.true;

      const deposit: Operations.DepositStruct = {
        accountId: accountId,
        tokenId: tokenId,
        amount: amount,
      };
      requestId = firstL1RequestId.add(totalPendingL1Requests).sub(1);
      success = await zkOBS.checkDepositL1Request(deposit, requestId);
      expect(success).to.be.true;
    });

    it('Commit single register with ETH - 1', async function () {
      zkOBS = zkOBS.connect(operator);

      const newBlocks: ZkOBS.CommitBlockStruct[] = [];

      commitBlock = {
        blockNumber: BigNumber.from(lastCommittedBlock.blockNumber).add(1),
        newStateRoot: newStateRoot,
        newTsRoot: newTsRoot,
        publicData: o_chunk,
        publicDataOffsets: pubdataOffset,
        timestamp: Date.now(),
      };

      newBlocks.push(commitBlock);
      const oriTotalCommittedBlocks = await zkOBS.committedBlockNum();
      const oriTotalCommittedL1Requests = await zkOBS.committedL1RequestNum();
      await zkOBS.commitBlocks(lastCommittedBlock, newBlocks);
      const newTotalCommittedBlocks = await zkOBS.committedBlockNum();
      const newTotalCommittedL1Requests = await zkOBS.committedL1RequestNum();
      expect(newTotalCommittedBlocks - oriTotalCommittedBlocks).to.be.eq(
        newBlocks.length,
      );
      expect(
        newTotalCommittedL1Requests.sub(oriTotalCommittedL1Requests),
      ).to.be.eq(1);
    });

    it('Prove single register with ETH - 1', async function () {
      // prove blocks
      const oriTotalProvedBlocks = await zkOBS.provedBlockNum();

      const committedBlocks: ZkOBS.StoredBlockStruct[] = [];
      const commitedBlock: ZkOBS.StoredBlockStruct = {
        blockNumber: commitBlock.blockNumber,
        stateRoot: commitBlock.newStateRoot,
        l1RequestNum: 1,
        pendingRollupTxHash: emptyHash,
        commitment: commitmentHashOrigin,
        timestamp: commitBlock.timestamp,
      };
      lastCommittedBlock = commitedBlock;
      committedBlocks.push(commitedBlock);
      const proofs: ZkOBS.ProofStruct[] = [];
      const proof: ZkOBS.ProofStruct = {
        a: [proof_a[0], proof_a[1]],
        b: [
          [proof_b[0][0], proof_b[0][1]],
          [proof_b[1][0], proof_b[1][1]],
        ],
        c: [proof_c[0], proof_c[1]],
        commitment: [proof_commitment[0]],
      };
      proofs.push(proof);

      await zkOBS.proveBlocks(committedBlocks, proofs);

      const newTotalProvedBlocks = await zkOBS.provedBlockNum();
      expect(newTotalProvedBlocks - oriTotalProvedBlocks).to.be.eq(
        committedBlocks.length,
      );
    });

    it('Execute single register with ETH - 1', async function () {
      // execute blocks
      const oriTotalExecutedBlocks = await zkOBS.executedBlockNum();
      const oriFirstL1RequestId = await zkOBS.firstL1RequestId();
      const oriTotalCommittedL1Requests = await zkOBS.committedL1RequestNum();
      const oriTotalPendingL1Requests = await zkOBS.pendingL1RequestNum();
      let pendingBlocks: ZkOBS.ExecuteBlockStruct[];
      let pendingRollupTxPubdata: any[] = [];
      const executeBlock: ZkOBS.ExecuteBlockStruct = {
        storedBlock: lastCommittedBlock,
        pendingRollupTxPubdata: pendingRollupTxPubdata,
      };
      pendingBlocks = [executeBlock];
      await zkOBS.executeBlocks(pendingBlocks);
      const newTotalExecutedBlocks = await zkOBS.executedBlockNum();
      const newFirstL1RequestId = await zkOBS.firstL1RequestId();
      const newTotalCommittedL1Requests = await zkOBS.committedL1RequestNum();
      const newTotalPendingL1Requests = await zkOBS.pendingL1RequestNum();
      expect(newTotalExecutedBlocks - oriTotalExecutedBlocks).to.be.eq(
        pendingBlocks.length,
      );
      let totalL1Requests = 0;
      for (let i = 0; i < pendingBlocks.length; i++) {
        totalL1Requests += pendingBlocks[i].storedBlock.l1RequestNum;
      }
      expect(newFirstL1RequestId - oriFirstL1RequestId).to.be.eq(
        totalL1Requests,
      );
      expect(
        oriTotalCommittedL1Requests - newTotalCommittedL1Requests,
      ).to.be.eq(totalL1Requests);
      expect(oriTotalPendingL1Requests - newTotalPendingL1Requests).to.be.eq(
        totalL1Requests,
      );
    });

    it('Commit single register with ETH - 2', async function () {
      let testIndex = 3;
      let {
        pubKeyX,
        pubKeyY,
        amount,
        oriStateRoot,
        newStateRoot,
        newTsRoot,
        commitmentHashOrigin,
        o_chunk,
        pubdataOffset,
        proof_a,
        proof_b,
        proof_c,
        proof_commitment,
      } = getRollupData(
        data[testIndex].inputs,
        data[testIndex].commitmentData,
        data[testIndex].callData,
      );
      zkOBS = zkOBS.connect(operator);

      const newBlocks: ZkOBS.CommitBlockStruct[] = [];
      commitBlock = {
        blockNumber: BigNumber.from(lastCommittedBlock.blockNumber).add(1),
        newStateRoot: newStateRoot,
        newTsRoot: newTsRoot,
        publicData: o_chunk,
        publicDataOffsets: pubdataOffset,
        timestamp: Date.now(),
      };

      newBlocks.push(commitBlock);
      const oriTotalCommittedBlocks = await zkOBS.committedBlockNum();
      const oriTotalCommittedL1Requests = await zkOBS.committedL1RequestNum();
      await zkOBS.commitBlocks(lastCommittedBlock, newBlocks);
      const newTotalCommittedBlocks = await zkOBS.committedBlockNum();
      const newTotalCommittedL1Requests = await zkOBS.committedL1RequestNum();
      expect(newTotalCommittedBlocks - oriTotalCommittedBlocks).to.be.eq(
        newBlocks.length,
      );
      expect(
        newTotalCommittedL1Requests.sub(oriTotalCommittedL1Requests),
      ).to.be.eq(1);
    });

    it('Prove single register with ETH - 2', async function () {
      let testIndex = 3;
      let {
        pubKeyX,
        pubKeyY,
        amount,
        oriStateRoot,
        newStateRoot,
        newTsRoot,
        commitmentHashOrigin,
        o_chunk,
        pubdataOffset,
        proof_a,
        proof_b,
        proof_c,
        proof_commitment,
      } = getRollupData(
        data[testIndex].inputs,
        data[testIndex].commitmentData,
        data[testIndex].callData,
      );
      // prove blocks
      const oriTotalProvedBlocks = await zkOBS.provedBlockNum();

      const committedBlocks: ZkOBS.StoredBlockStruct[] = [];
      const commitedBlock: ZkOBS.StoredBlockStruct = {
        blockNumber: commitBlock.blockNumber,
        stateRoot: commitBlock.newStateRoot,
        l1RequestNum: 1,
        pendingRollupTxHash: emptyHash,
        commitment: commitmentHashOrigin,
        timestamp: commitBlock.timestamp,
      };
      lastCommittedBlock = commitedBlock;
      committedBlocks.push(commitedBlock);
      const proofs: ZkOBS.ProofStruct[] = [];
      const proof: ZkOBS.ProofStruct = {
        a: [proof_a[0], proof_a[1]],
        b: [
          [proof_b[0][0], proof_b[0][1]],
          [proof_b[1][0], proof_b[1][1]],
        ],
        c: [proof_c[0], proof_c[1]],
        commitment: [proof_commitment[0]],
      };
      proofs.push(proof);

      await zkOBS.proveBlocks(committedBlocks, proofs);

      const newTotalProvedBlocks = await zkOBS.provedBlockNum();
      expect(newTotalProvedBlocks - oriTotalProvedBlocks).to.be.eq(
        committedBlocks.length,
      );
    });

    it('Execute single register with ETH - 2', async function () {
      // execute blocks
      const oriTotalExecutedBlocks = await zkOBS.executedBlockNum();
      const oriFirstL1RequestId = await zkOBS.firstL1RequestId();
      const oriTotalCommittedL1Requests = await zkOBS.committedL1RequestNum();
      const oriTotalPendingL1Requests = await zkOBS.pendingL1RequestNum();
      let pendingBlocks: ZkOBS.ExecuteBlockStruct[];
      let pendingRollupTxPubdata: any[] = [];
      const executeBlock: ZkOBS.ExecuteBlockStruct = {
        storedBlock: lastCommittedBlock,
        pendingRollupTxPubdata: pendingRollupTxPubdata,
      };
      pendingBlocks = [executeBlock];
      await zkOBS.executeBlocks(pendingBlocks);
      const newTotalExecutedBlocks = await zkOBS.executedBlockNum();
      const newFirstL1RequestId = await zkOBS.firstL1RequestId();
      const newTotalCommittedL1Requests = await zkOBS.committedL1RequestNum();
      const newTotalPendingL1Requests = await zkOBS.pendingL1RequestNum();

      expect(newTotalExecutedBlocks - oriTotalExecutedBlocks).to.be.eq(
        pendingBlocks.length,
      );
      let totalL1Requests = 0;
      for (let i = 0; i < pendingBlocks.length; i++) {
        totalL1Requests += pendingBlocks[i].storedBlock.l1RequestNum;
      }
      expect(newFirstL1RequestId - oriFirstL1RequestId).to.be.eq(
        totalL1Requests,
      );
      expect(
        oriTotalCommittedL1Requests - newTotalCommittedL1Requests,
      ).to.be.eq(totalL1Requests);
      expect(oriTotalPendingL1Requests - newTotalPendingL1Requests).to.be.eq(
        totalL1Requests,
      );
    });
  });

  describe('Rollup for Acc1 single withdraw with USDC', function () {
    const data = initTestData(BaseDir);
    const testIndex = 4;
    const {
      pubKeyX,
      pubKeyY,
      amount,
      oriStateRoot,
      newStateRoot,
      newTsRoot,
      commitmentHashOrigin,
      o_chunk,
      pubdataOffset,
      proof_a,
      proof_b,
      proof_c,
      proof_commitment,
    } = getRollupData(
      data[testIndex].inputs,
      data[testIndex].commitmentData,
      data[testIndex].callData,
    );
    it('Commit Acc1 single withdraw with USDC', async function () {
      const newBlocks: ZkOBS.CommitBlockStruct[] = [];

      commitBlock = {
        blockNumber: BigNumber.from(lastCommittedBlock.blockNumber).add(1),
        newStateRoot: newStateRoot,
        newTsRoot: newTsRoot,
        publicData: o_chunk,
        publicDataOffsets: pubdataOffset,
        timestamp: Date.now(),
      };
      console.log({ pubdataOffset, o_chunk });
      newBlocks.push(commitBlock);
      const oriTotalCommittedBlocks = await zkOBS.committedBlockNum();
      await zkOBS.commitBlocks(lastCommittedBlock, newBlocks);
      const newTotalCommittedBlocks = await zkOBS.committedBlockNum();
      expect(newTotalCommittedBlocks - oriTotalCommittedBlocks).to.be.eq(
        newBlocks.length,
      );
    });

    it('Prove Acc1 single withdraw with USDC', async function () {
      // prove blocks
      const oriTotalProvedBlocks = await zkOBS.provedBlockNum();

      const committedBlocks: ZkOBS.StoredBlockStruct[] = [];
      const tokenIdUSDC = await zkOBS.tokenIdOf(zkUSDC.address);
      const accountId = await zkOBS.accountIdOf(await user1.getAddress());
      let pendingRollupTxHash = emptyHash;

      const publicData = ethers.utils
        .solidityPack(
          ['uint8', 'uint32', 'uint16', 'uint128'],
          [OpType.WITHDRAW, accountId, tokenIdUSDC, amount],
        )
        .padEnd((2 * 12 * 8) / 4 + 2, '0');
      console.log('s ori hash:');
      console.log(pendingRollupTxHash);
      console.log('s pubdata:');
      console.log(publicData);

      pendingRollupTxHash = ethers.utils.keccak256(
        ethers.utils.solidityPack(
          ['bytes32', 'bytes'],
          [pendingRollupTxHash, publicData],
        ),
      );
      console.log('s new hash:');
      console.log(pendingRollupTxHash);
      const commitedBlock: ZkOBS.StoredBlockStruct = {
        blockNumber: commitBlock.blockNumber,
        stateRoot: commitBlock.newStateRoot,
        l1RequestNum: 0,
        pendingRollupTxHash: pendingRollupTxHash,
        commitment: commitmentHashOrigin,
        timestamp: commitBlock.timestamp,
      };
      lastCommittedBlock = commitedBlock;
      committedBlocks.push(commitedBlock);
      const proofs: ZkOBS.ProofStruct[] = [];
      const proof: ZkOBS.ProofStruct = {
        a: [proof_a[0], proof_a[1]],
        b: [
          [proof_b[0][0], proof_b[0][1]],
          [proof_b[1][0], proof_b[1][1]],
        ],
        c: [proof_c[0], proof_c[1]],
        commitment: [proof_commitment[0]],
      };
      proofs.push(proof);

      await zkOBS.proveBlocks(committedBlocks, proofs);

      const newTotalProvedBlocks = await zkOBS.provedBlockNum();
      expect(newTotalProvedBlocks - oriTotalProvedBlocks).to.be.eq(
        committedBlocks.length,
      );
    });

    it('Execute Acc1 single withdraw with USDC', async function () {
      // execute blocks
      const oriTotalExecutedBlocks = await zkOBS.executedBlockNum();
      let pendingBlocks: ZkOBS.ExecuteBlockStruct[];
      const tokenIdUSDC = await zkOBS.tokenIdOf(zkUSDC.address);
      const accountId = await zkOBS.accountIdOf(await user1.getAddress());
      const publicData = ethers.utils
        .solidityPack(
          ['uint8', 'uint32', 'uint16', 'uint128'],
          [OpType.WITHDRAW, accountId, tokenIdUSDC, amount],
        )
        .padEnd((2 * 12 * 8) / 4 + 2, '0');
      let pendingRollupTxPubdata: any[] = [publicData];
      const key = ethers.utils.solidityPack(
        ['uint16', 'uint160'],
        [tokenIdUSDC, await user1.getAddress()],
      );
      const executeBlock: ZkOBS.ExecuteBlockStruct = {
        storedBlock: lastCommittedBlock,
        pendingRollupTxPubdata: pendingRollupTxPubdata,
      };
      pendingBlocks = [executeBlock];
      const oriPendingBalances = await zkOBS.pendingBalances(key);
      await zkOBS.executeBlocks(pendingBlocks);
      const newTotalExecutedBlocks = await zkOBS.executedBlockNum();
      const newPendingBalances = await zkOBS.pendingBalances(key);
      expect(newTotalExecutedBlocks - oriTotalExecutedBlocks).to.be.eq(
        pendingBlocks.length,
      );
      expect(newPendingBalances - oriPendingBalances).to.be.eq(amount);
    });

    it('Withdraw Acc1 single withdraw with USDC', async function () {
      const tokenIdUSDC = await zkOBS.tokenIdOf(zkUSDC.address);
      const oriUSDCBalance = await zkUSDC.balanceOf(zkOBS.address);
      const oriPendingBalances = await zkOBS.pendingBalances(
        ethers.utils.solidityPack(
          ['uint16', 'uint160'],
          [tokenIdUSDC, await user1.getAddress()],
        ),
      );
      const oriUser1Balance = await zkUSDC.balanceOf(await user1.getAddress());
      await zkOBS.connect(user1).withdrawERC20(zkUSDC.address, amount);
      const newUSDCBalance = await zkUSDC.balanceOf(zkOBS.address);
      const newUser1Balance = await zkUSDC.balanceOf(await user1.getAddress());
      const newPendingBalances = await zkOBS.pendingBalances(
        ethers.utils.solidityPack(
          ['uint16', 'uint160'],
          [tokenIdUSDC, await user1.getAddress()],
        ),
      );
      expect(newUSDCBalance.sub(oriUSDCBalance)).to.be.eq(-amount);
      expect(newPendingBalances - oriPendingBalances).to.be.eq(-amount);
      expect(newUser1Balance.sub(oriUser1Balance)).to.be.eq(amount);
    });
  });

  // describe('Rollup for Acc1 place order to buy USDC with ETH', function () {
  //   const {
  //     pubKeyX,
  //     pubKeyY,
  //     amount,
  //     oriStateRoot,
  //     newStateRoot,
  //     newTsRoot,
  //     commitmentHashOrigin,
  //     o_chunk,
  //     pubdataOffset,
  //     proof_a,
  //     proof_b,
  //     proof_c,
  //     proof_commitment,
  //   } = getRollupData(inputs5, root5, calldata5);

  //   it('Commit Acc1 place order to buy USDC with ETH', async function () {
  //     zkOBS = zkOBS.connect(operator);

  //     const newBlocks: ZkOBS.CommitBlockStruct[] = [];
  //     const tokenIdWETH = await zkOBS.tokenIdOf(wETH.address);
  //     const accountId = await zkOBS.accountIdOf(await user1.getAddress());
  //     const publicData = ethers.utils
  //       .solidityPack(
  //         ['uint8', 'uint32', 'uint16', 'uint40'],
  //         [
  //           OpType.SECONDLIMITORDER,
  //           accountId,
  //           tokenIdWETH,
  //           amountToTxAmountV3_40bit(BigInt(amount.toString())),
  //         ],
  //       )
  //       .padEnd((CALLDATA_CHUNK * 12 * 8) / 4 + 2, '0');

  //     commitBlock = {
  //       blockNumber: BigNumber.from(lastCommittedBlock.blockNumber).add(1),
  //       newStateRoot: newStateRoot,
  //       newTsRoot: newTsRoot,
  //       publicData: o_chunk,
  //       publicDataOffsets: pubdataOffset,
  //       timestamp: Date.now(),
  //     };

  //     newBlocks.push(commitBlock);
  //     const oriTotalCommittedBlocks = await zkOBS.committedBlockNum();
  //     await zkOBS.commitBlocks(lastCommittedBlock, newBlocks);
  //     const newTotalCommittedBlocks = await zkOBS.committedBlockNum();
  //     expect(newTotalCommittedBlocks - oriTotalCommittedBlocks).to.be.eq(
  //       newBlocks.length,
  //     );
  //   });

  //   it('Prove Acc1 place order to buy USDC with ETH', async function () {
  //     // prove blocks
  //     const oriTotalProvedBlocks = await zkOBS.provedBlockNum();

  //     const committedBlocks: ZkOBS.StoredBlockStruct[] = [];
  //     const commitedBlock: ZkOBS.StoredBlockStruct = {
  //       blockNumber: commitBlock.blockNumber,
  //       stateRoot: commitBlock.newStateRoot,
  //       l1RequestNum: 0,
  //       pendingRollupTxHash: emptyHash,
  //       commitment: commitmentHashOrigin,
  //       timestamp: commitBlock.timestamp,
  //     };
  //     lastCommittedBlock = commitedBlock;
  //     committedBlocks.push(commitedBlock);
  //     const proofs: ZkOBS.ProofStruct[] = [];
  //     const proof: ZkOBS.ProofStruct = {
  //       a: [proof_a[0], proof_a[1]],
  //       b: [
  //         [proof_b[0][0], proof_b[0][1]],
  //         [proof_b[1][0], proof_b[1][1]],
  //       ],
  //       c: [proof_c[0], proof_c[1]],
  //       commitment: [proof_commitment[0]],
  //     };
  //     proofs.push(proof);

  //     await zkOBS.proveBlocks(committedBlocks, proofs);

  //     const newTotalProvedBlocks = await zkOBS.provedBlockNum();
  //     expect(newTotalProvedBlocks - oriTotalProvedBlocks).to.be.eq(
  //       committedBlocks.length,
  //     );
  //   });

  //   it('Execute Acc1 place order to buy USDC with ETH', async function () {
  //     // execute blocks
  //     const oriTotalExecutedBlocks = await zkOBS.executedBlockNum();
  //     let pendingBlocks: ZkOBS.ExecuteBlockStruct[];
  //     let pendingRollupTxPubdata: any[] = [];
  //     const executeBlock: ZkOBS.ExecuteBlockStruct = {
  //       storedBlock: lastCommittedBlock,
  //       pendingRollupTxPubdata: pendingRollupTxPubdata,
  //     };
  //     pendingBlocks = [executeBlock];
  //     await zkOBS.executeBlocks(pendingBlocks);
  //     const newTotalExecutedBlocks = await zkOBS.executedBlockNum();
  //     expect(newTotalExecutedBlocks - oriTotalExecutedBlocks).to.be.eq(
  //       pendingBlocks.length,
  //     );
  //   });
  // });

  // describe('Rollup for Acc2 place order to buy USDC with ETH', function () {
  //   const {
  //     pubKeyX,
  //     pubKeyY,
  //     amount,
  //     oriStateRoot,
  //     newStateRoot,
  //     newTsRoot,
  //     commitmentHashOrigin,
  //     o_chunk,
  //     pubdataOffset,
  //     proof_a,
  //     proof_b,
  //     proof_c,
  //     proof_commitment,
  //   } = getRollupData(inputs6, root6, calldata6);

  //   it('Commit Acc2 place order to buy ETH with USDC', async function () {
  //     zkOBS = zkOBS.connect(operator);

  //     const newBlocks: ZkOBS.CommitBlockStruct[] = [];
  //     const tokenIdUSDC = await zkOBS.tokenIdOf(zkUSDC.address);
  //     const accountId = await zkOBS.accountIdOf(await user2.getAddress());
  //     const publicData = ethers.utils
  //       .solidityPack(
  //         ['uint8', 'uint32', 'uint16', 'uint40'],
  //         [
  //           OpType.SECONDLIMITORDER,
  //           accountId,
  //           tokenIdUSDC,
  //           amountToTxAmountV3_40bit(BigInt(amount.toString())),
  //         ],
  //       )
  //       .padEnd((CALLDATA_CHUNK * 12 * 8) / 4 + 2, '0');

  //     commitBlock = {
  //       blockNumber: BigNumber.from(lastCommittedBlock.blockNumber).add(1),
  //       newStateRoot: newStateRoot,
  //       newTsRoot: newTsRoot,
  //       publicData: o_chunk,
  //       publicDataOffsets: pubdataOffset,
  //       timestamp: Date.now(),
  //     };

  //     newBlocks.push(commitBlock);
  //     const oriTotalCommittedBlocks = await zkOBS.committedBlockNum();
  //     await zkOBS.commitBlocks(lastCommittedBlock, newBlocks);
  //     const newTotalCommittedBlocks = await zkOBS.committedBlockNum();
  //     expect(newTotalCommittedBlocks - oriTotalCommittedBlocks).to.be.eq(
  //       newBlocks.length,
  //     );
  //   });

  //   it('Prove Acc2 place order to buy ETH with USDC', async function () {
  //     // prove blocks
  //     const oriTotalProvedBlocks = await zkOBS.provedBlockNum();

  //     const committedBlocks: ZkOBS.StoredBlockStruct[] = [];
  //     const commitedBlock: ZkOBS.StoredBlockStruct = {
  //       blockNumber: commitBlock.blockNumber,
  //       stateRoot: commitBlock.newStateRoot,
  //       l1RequestNum: 0,
  //       pendingRollupTxHash: emptyHash,
  //       commitment: commitmentHashOrigin,
  //       timestamp: commitBlock.timestamp,
  //     };
  //     lastCommittedBlock = commitedBlock;
  //     committedBlocks.push(commitedBlock);
  //     const proofs: ZkOBS.ProofStruct[] = [];
  //     const proof: ZkOBS.ProofStruct = {
  //       a: [proof_a[0], proof_a[1]],
  //       b: [
  //         [proof_b[0][0], proof_b[0][1]],
  //         [proof_b[1][0], proof_b[1][1]],
  //       ],
  //       c: [proof_c[0], proof_c[1]],
  //       commitment: [proof_commitment[0]],
  //     };
  //     proofs.push(proof);

  //     await zkOBS.proveBlocks(committedBlocks, proofs);

  //     const newTotalProvedBlocks = await zkOBS.provedBlockNum();
  //     expect(newTotalProvedBlocks - oriTotalProvedBlocks).to.be.eq(
  //       committedBlocks.length,
  //     );
  //   });

  //   it('Execute Acc2 place order to buy ETH with USDC', async function () {
  //     // execute blocks
  //     const oriTotalExecutedBlocks = await zkOBS.executedBlockNum();
  //     let pendingBlocks: ZkOBS.ExecuteBlockStruct[];
  //     let pendingRollupTxPubdata: any[] = [];
  //     const executeBlock: ZkOBS.ExecuteBlockStruct = {
  //       storedBlock: lastCommittedBlock,
  //       pendingRollupTxPubdata: pendingRollupTxPubdata,
  //     };
  //     pendingBlocks = [executeBlock];
  //     await zkOBS.executeBlocks(pendingBlocks);
  //     const newTotalExecutedBlocks = await zkOBS.executedBlockNum();
  //     expect(newTotalExecutedBlocks - oriTotalExecutedBlocks).to.be.eq(
  //       pendingBlocks.length,
  //     );
  //   });
  // });

  // describe('Rollup for Acc2 place order to buy USDC with ETH', function () {
  //   const {
  //     pubKeyX,
  //     pubKeyY,
  //     amount,
  //     oriStateRoot,
  //     newStateRoot,
  //     newTsRoot,
  //     commitmentHashOrigin,
  //     o_chunk,
  //     pubdataOffset,
  //     proof_a,
  //     proof_b,
  //     proof_c,
  //     proof_commitment,
  //   } = getRollupData(inputs7, root7, calldata7);

  //   it('Commit Acc2 place order to buy ETH with USDC', async function () {
  //     zkOBS = zkOBS.connect(operator);

  //     const newBlocks: ZkOBS.CommitBlockStruct[] = [];
  //     const tokenIdUSDC = await zkOBS.tokenIdOf(zkUSDC.address);
  //     const accountId = await zkOBS.accountIdOf(await user2.getAddress());
  //     const publicData = ethers.utils
  //       .solidityPack(
  //         ['uint8', 'uint32', 'uint16', 'uint40'],
  //         [
  //           OpType.SECONDLIMITORDER,
  //           accountId,
  //           tokenIdUSDC,
  //           amountToTxAmountV3_40bit(BigInt(amount.toString())),
  //         ],
  //       )
  //       .padEnd((CALLDATA_CHUNK * 12 * 8) / 4 + 2, '0');

  //     commitBlock = {
  //       blockNumber: BigNumber.from(lastCommittedBlock.blockNumber).add(1),
  //       newStateRoot: newStateRoot,
  //       newTsRoot: newTsRoot,
  //       publicData: o_chunk,
  //       publicDataOffsets: pubdataOffset,
  //       timestamp: Date.now(),
  //     };

  //     newBlocks.push(commitBlock);
  //     const oriTotalCommittedBlocks = await zkOBS.committedBlockNum();
  //     await zkOBS.commitBlocks(lastCommittedBlock, newBlocks);
  //     const newTotalCommittedBlocks = await zkOBS.committedBlockNum();
  //     expect(newTotalCommittedBlocks - oriTotalCommittedBlocks).to.be.eq(
  //       newBlocks.length,
  //     );
  //   });

  //   it('Prove Acc2 place order to buy ETH with USDC', async function () {
  //     // prove blocks
  //     const oriTotalProvedBlocks = await zkOBS.provedBlockNum();

  //     const committedBlocks: ZkOBS.StoredBlockStruct[] = [];
  //     const commitedBlock: ZkOBS.StoredBlockStruct = {
  //       blockNumber: commitBlock.blockNumber,
  //       stateRoot: commitBlock.newStateRoot,
  //       l1RequestNum: 0,
  //       pendingRollupTxHash: emptyHash,
  //       commitment: commitmentHashOrigin,
  //       timestamp: commitBlock.timestamp,
  //     };
  //     lastCommittedBlock = commitedBlock;
  //     committedBlocks.push(commitedBlock);
  //     const proofs: ZkOBS.ProofStruct[] = [];
  //     const proof: ZkOBS.ProofStruct = {
  //       a: [proof_a[0], proof_a[1]],
  //       b: [
  //         [proof_b[0][0], proof_b[0][1]],
  //         [proof_b[1][0], proof_b[1][1]],
  //       ],
  //       c: [proof_c[0], proof_c[1]],
  //       commitment: [proof_commitment[0]],
  //     };
  //     proofs.push(proof);

  //     await zkOBS.proveBlocks(committedBlocks, proofs);

  //     const newTotalProvedBlocks = await zkOBS.provedBlockNum();
  //     expect(newTotalProvedBlocks - oriTotalProvedBlocks).to.be.eq(
  //       committedBlocks.length,
  //     );
  //   });

  //   it('Execute Acc2 place order to buy ETH with USDC', async function () {
  //     // execute blocks
  //     const oriTotalExecutedBlocks = await zkOBS.executedBlockNum();
  //     let pendingBlocks: ZkOBS.ExecuteBlockStruct[];
  //     let pendingRollupTxPubdata: any[] = [];
  //     const executeBlock: ZkOBS.ExecuteBlockStruct = {
  //       storedBlock: lastCommittedBlock,
  //       pendingRollupTxPubdata: pendingRollupTxPubdata,
  //     };
  //     pendingBlocks = [executeBlock];
  //     await zkOBS.executeBlocks(pendingBlocks);
  //     const newTotalExecutedBlocks = await zkOBS.executedBlockNum();
  //     expect(newTotalExecutedBlocks - oriTotalExecutedBlocks).to.be.eq(
  //       pendingBlocks.length,
  //     );
  //   });
  // });

  // describe('Rollup for match', function () {
  //   const {
  //     pubKeyX,
  //     pubKeyY,
  //     amount,
  //     oriStateRoot,
  //     newStateRoot,
  //     newTsRoot,
  //     commitmentHashOrigin,
  //     o_chunk,
  //     pubdataOffset,
  //     proof_a,
  //     proof_b,
  //     proof_c,
  //     proof_commitment,
  //   } = getRollupData(inputs8, root8, calldata8);

  //   it('Commit Acc2 place order to buy ETH with USDC', async function () {
  //     zkOBS = zkOBS.connect(operator);

  //     const newBlocks: ZkOBS.CommitBlockStruct[] = [];

  //     commitBlock = {
  //       blockNumber: BigNumber.from(lastCommittedBlock.blockNumber).add(1),
  //       newStateRoot: newStateRoot,
  //       newTsRoot: newTsRoot,
  //       publicData: o_chunk,
  //       publicDataOffsets: pubdataOffset,
  //       timestamp: Date.now(),
  //     };

  //     newBlocks.push(commitBlock);
  //     const oriTotalCommittedBlocks = await zkOBS.committedBlockNum();
  //     await zkOBS.commitBlocks(lastCommittedBlock, newBlocks);
  //     const newTotalCommittedBlocks = await zkOBS.committedBlockNum();
  //     expect(newTotalCommittedBlocks - oriTotalCommittedBlocks).to.be.eq(
  //       newBlocks.length,
  //     );
  //   });

  //   it('Prove for match', async function () {
  //     // prove blocks
  //     const oriTotalProvedBlocks = await zkOBS.provedBlockNum();

  //     const committedBlocks: ZkOBS.StoredBlockStruct[] = [];
  //     const commitedBlock: ZkOBS.StoredBlockStruct = {
  //       blockNumber: commitBlock.blockNumber,
  //       stateRoot: commitBlock.newStateRoot,
  //       l1RequestNum: 0,
  //       pendingRollupTxHash: emptyHash,
  //       commitment: commitmentHashOrigin,
  //       timestamp: commitBlock.timestamp,
  //     };
  //     lastCommittedBlock = commitedBlock;
  //     committedBlocks.push(commitedBlock);
  //     const proofs: ZkOBS.ProofStruct[] = [];
  //     const proof: ZkOBS.ProofStruct = {
  //       a: [proof_a[0], proof_a[1]],
  //       b: [
  //         [proof_b[0][0], proof_b[0][1]],
  //         [proof_b[1][0], proof_b[1][1]],
  //       ],
  //       c: [proof_c[0], proof_c[1]],
  //       commitment: [proof_commitment[0]],
  //     };
  //     proofs.push(proof);

  //     await zkOBS.proveBlocks(committedBlocks, proofs);

  //     const newTotalProvedBlocks = await zkOBS.provedBlockNum();
  //     expect(newTotalProvedBlocks - oriTotalProvedBlocks).to.be.eq(
  //       committedBlocks.length,
  //     );
  //   });

  //   it('Execute match', async function () {
  //     // execute blocks
  //     const oriTotalExecutedBlocks = await zkOBS.executedBlockNum();
  //     let pendingBlocks: ZkOBS.ExecuteBlockStruct[];
  //     let pendingRollupTxPubdata: any[] = [];
  //     const executeBlock: ZkOBS.ExecuteBlockStruct = {
  //       storedBlock: lastCommittedBlock,
  //       pendingRollupTxPubdata: pendingRollupTxPubdata,
  //     };
  //     pendingBlocks = [executeBlock];
  //     await zkOBS.executeBlocks(pendingBlocks);
  //     const newTotalExecutedBlocks = await zkOBS.executedBlockNum();
  //     expect(newTotalExecutedBlocks - oriTotalExecutedBlocks).to.be.eq(
  //       pendingBlocks.length,
  //     );
  //   });
  // });
  // describe('Rollup for noop', function () {
  //   const {
  //     pubKeyX,
  //     pubKeyY,
  //     amount,
  //     oriStateRoot,
  //     newStateRoot,
  //     newTsRoot,
  //     commitmentHashOrigin,
  //     o_chunk,
  //     pubdataOffset,
  //     proof_a,
  //     proof_b,
  //     proof_c,
  //     proof_commitment,
  //   } = getRollupData(inputs9, root9, calldata9);

  //   it('Commit noop', async function () {
  //     zkOBS = zkOBS.connect(operator);

  //     const newBlocks: ZkOBS.CommitBlockStruct[] = [];

  //     commitBlock = {
  //       blockNumber: BigNumber.from(lastCommittedBlock.blockNumber).add(1),
  //       newStateRoot: newStateRoot,
  //       newTsRoot: newTsRoot,
  //       publicData: o_chunk,
  //       publicDataOffsets: pubdataOffset,
  //       timestamp: Date.now(),
  //     };

  //     newBlocks.push(commitBlock);
  //     const oriTotalCommittedBlocks = await zkOBS.committedBlockNum();
  //     await zkOBS.commitBlocks(lastCommittedBlock, newBlocks);
  //     const newTotalCommittedBlocks = await zkOBS.committedBlockNum();
  //     expect(newTotalCommittedBlocks - oriTotalCommittedBlocks).to.be.eq(
  //       newBlocks.length,
  //     );
  //   });

  //   it('Prove for noop', async function () {
  //     // prove blocks
  //     const oriTotalProvedBlocks = await zkOBS.provedBlockNum();

  //     const committedBlocks: ZkOBS.StoredBlockStruct[] = [];
  //     const commitedBlock: ZkOBS.StoredBlockStruct = {
  //       blockNumber: commitBlock.blockNumber,
  //       stateRoot: commitBlock.newStateRoot,
  //       l1RequestNum: 0,
  //       pendingRollupTxHash: emptyHash,
  //       commitment: commitmentHashOrigin,
  //       timestamp: commitBlock.timestamp,
  //     };
  //     lastCommittedBlock = commitedBlock;
  //     committedBlocks.push(commitedBlock);
  //     const proofs: ZkOBS.ProofStruct[] = [];
  //     const proof: ZkOBS.ProofStruct = {
  //       a: [proof_a[0], proof_a[1]],
  //       b: [
  //         [proof_b[0][0], proof_b[0][1]],
  //         [proof_b[1][0], proof_b[1][1]],
  //       ],
  //       c: [proof_c[0], proof_c[1]],
  //       commitment: [proof_commitment[0]],
  //     };
  //     proofs.push(proof);

  //     await zkOBS.proveBlocks(committedBlocks, proofs);

  //     const newTotalProvedBlocks = await zkOBS.provedBlockNum();
  //     expect(newTotalProvedBlocks - oriTotalProvedBlocks).to.be.eq(
  //       committedBlocks.length,
  //     );
  //   });

  //   it('Execute noop', async function () {
  //     // execute blocks
  //     const oriTotalExecutedBlocks = await zkOBS.executedBlockNum();
  //     let pendingBlocks: ZkOBS.ExecuteBlockStruct[];
  //     let pendingRollupTxPubdata: any[] = [];
  //     const executeBlock: ZkOBS.ExecuteBlockStruct = {
  //       storedBlock: lastCommittedBlock,
  //       pendingRollupTxPubdata: pendingRollupTxPubdata,
  //     };
  //     pendingBlocks = [executeBlock];
  //     await zkOBS.executeBlocks(pendingBlocks);
  //     const newTotalExecutedBlocks = await zkOBS.executedBlockNum();
  //     expect(newTotalExecutedBlocks - oriTotalExecutedBlocks).to.be.eq(
  //       pendingBlocks.length,
  //     );
  //   });
  // });
});
