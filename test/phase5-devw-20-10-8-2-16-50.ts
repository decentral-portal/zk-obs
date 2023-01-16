import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import {
  deploy,
  genTsAddr,
  initTestData,
  getPubDataOffset,
  stateToCommitment,
} from './utils';
import { OpType } from './Types';
import { emptyHash } from './Config';
import { BigNumber, ethers, Signer } from 'ethers';
import { ERC20FreeMint, WBTC, WETH9, ZkOBS } from '../typechain-types';
import { expect } from 'chai';

//! Change this for different test data
import initStates from './phase5-devw-20-10-8-2-16-50/initStates.json';
const testDataPath = './test/phase5-devw-20-10-8-2-16-50';

describe('Rollup', function () {
  let operator: Signer;
  let acc1: Signer;
  let acc2: Signer;
  let wETH: WETH9;
  let wBTC: WBTC;
  let USDT: ERC20FreeMint;
  let USDC: ERC20FreeMint;
  let DAI: ERC20FreeMint;
  let zkOBS: ZkOBS;

  let data = initTestData(testDataPath);
  let lastCommittedBlock: ZkOBS.StoredBlockStruct;
  let storedBlocks: ZkOBS.StoredBlockStruct[] = [];
  let provedBlockNum = 0;

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

  before(async function () {
    const {
      operator: _operator,
      user1: _user1,
      user2: _user2,
      wETH: _wETH,
      wBTC: _wBTC,
      USDT: _USDT,
      USDC: _USDC,
      DAI: _DAI,
      zkOBS: _zkOBS,
    } = await deploy(initStates.stateRoot);
    operator = _operator;
    acc1 = _user1;
    acc2 = _user2;
    wETH = _wETH;
    wBTC = _wBTC;
    USDT = _USDT;
    USDC = _USDC;
    DAI = _DAI;
    zkOBS = _zkOBS;

    // whitelist token
    // await zkOBS.connect(operator).addToken(wBTC.address);
    await zkOBS.connect(operator).addToken(USDT.address, 6);
    // await zkOBS.connect(operator).addToken(USDC.address);
    // await zkOBS.connect(operator).addToken(DAI.address);
  });

  describe('Noop', function () {
    const testCaseId = 0;

    it('Commit', async function () {
      const newBlocks: ZkOBS.CommitBlockStruct[] = [];

      let testData = data[testCaseId];
      let commitBlock: ZkOBS.CommitBlockStruct = {
        blockNumber: BigNumber.from(lastCommittedBlock.blockNumber).add(1),
        newStateRoot: testData.commitmentData.newStateRoot,
        newTsRoot: testData.commitmentData.newTsRoot,
        publicData: testData.commitmentData.o_chunk,
        publicDataOffsets: getPubDataOffset(
          testData.commitmentData.isCriticalChunk,
        ),
        timestamp: Date.now(),
      };
      newBlocks.push(commitBlock);
      let commitmentHash = stateToCommitment(testData.commitmentData);
      let storedBlock: ZkOBS.StoredBlockStruct = {
        blockNumber: commitBlock.blockNumber,
        l1RequestNum: 0,
        pendingRollupTxHash: emptyHash,
        commitment: commitmentHash,
        stateRoot: commitBlock.newStateRoot,
        timestamp: commitBlock.timestamp,
      };
      storedBlocks.push(storedBlock);

      const oriCommittedBlockNum = await zkOBS.committedBlockNum();
      const oriCommittedL1RequestNum = await zkOBS.committedL1RequestNum();
      await zkOBS.commitBlocks(lastCommittedBlock, newBlocks);
      lastCommittedBlock = storedBlocks[storedBlocks.length - 1];
      const newCommittedBlockNum = await zkOBS.committedBlockNum();
      const newCommittedL1RequestNum = await zkOBS.committedL1RequestNum();

      expect(newCommittedBlockNum - oriCommittedBlockNum).to.be.eq(
        newBlocks.length,
      );
      expect(newCommittedL1RequestNum.sub(oriCommittedL1RequestNum)).to.be.eq(
        0,
      );
    });

    it('Prove', async function () {
      const committedBlocks: ZkOBS.StoredBlockStruct[] = [];
      let testData = data[testCaseId];
      let committedBlock: ZkOBS.StoredBlockStruct = {
        blockNumber: storedBlocks[provedBlockNum].blockNumber,
        stateRoot: storedBlocks[provedBlockNum].stateRoot,
        l1RequestNum: 0,
        pendingRollupTxHash: emptyHash,
        commitment: storedBlocks[provedBlockNum].commitment,
        timestamp: storedBlocks[provedBlockNum].timestamp,
      };
      committedBlocks.push(committedBlock);
      provedBlockNum++;

      const proofs: ZkOBS.ProofStruct[] = [];
      testData = data[testCaseId];
      let proof_a = testData.callData[0];
      let proof_b = testData.callData[1];
      let proof_c = testData.callData[2];
      let proof_commitment = testData.callData[3];
      let proof: ZkOBS.ProofStruct = {
        a: [proof_a[0], proof_a[1]],
        b: [
          [proof_b[0][0], proof_b[0][1]],
          [proof_b[1][0], proof_b[1][1]],
        ],
        c: [proof_c[0], proof_c[1]],
        commitment: proof_commitment,
      };
      proofs.push(proof);

      const oriProvedBlockNum = await zkOBS.provedBlockNum();
      await zkOBS.proveBlocks(committedBlocks, proofs);
      const newProvedBlockNum = await zkOBS.provedBlockNum();
      expect(newProvedBlockNum - oriProvedBlockNum).to.be.eq(
        committedBlocks.length,
      );
    });
    it('Execute', async function () {
      let pendingBlocks: ZkOBS.ExecuteBlockStruct[] = [];
      let pendingRollupTxPubdata: any[] = [];
      const executeBlock: ZkOBS.ExecuteBlockStruct = {
        storedBlock: storedBlocks[storedBlocks.length - 1],
        pendingRollupTxPubdata: pendingRollupTxPubdata,
      };
      pendingBlocks.push(executeBlock);

      const oriExecutedBlockNum = await zkOBS.executedBlockNum();
      const oriFirstL1RequestId = await zkOBS.firstL1RequestId();
      const oriCommittedL1RequestNum = await zkOBS.committedL1RequestNum();
      const oriPendingL1RequestNum = await zkOBS.pendingL1RequestNum();
      await zkOBS.executeBlocks(pendingBlocks);
      const newExecutedBlockNum = await zkOBS.executedBlockNum();
      const newFirstL1RequestId = await zkOBS.firstL1RequestId();
      const newCommittedL1RequestNum = await zkOBS.committedL1RequestNum();
      const newPendingL1RequestNum = await zkOBS.pendingL1RequestNum();

      let executedL1RequestNum = BigNumber.from(`0`);
      for (let i = 0; i < pendingBlocks.length; i++) {
        executedL1RequestNum = executedL1RequestNum.add(
          pendingBlocks[i].storedBlock.l1RequestNum,
        );
      }

      expect(newExecutedBlockNum - oriExecutedBlockNum).to.be.eq(
        pendingBlocks.length,
      );
      expect(newFirstL1RequestId.sub(oriFirstL1RequestId)).to.be.eq(
        executedL1RequestNum,
      );
      expect(newCommittedL1RequestNum.sub(oriCommittedL1RequestNum)).to.be.eq(
        executedL1RequestNum,
      );
      expect(newPendingL1RequestNum.sub(oriCommittedL1RequestNum)).to.be.eq(
        -executedL1RequestNum,
      );
    });
  });

  describe('Register Acc1 with USDT', function () {
    const testCaseId = 1;
    const [pubKeyX, pubKeyY] = data[testCaseId].inputs.tsPubKey[0];
    const amount = data[testCaseId].inputs.reqData[1][3];

    it('Mimic Register', async function () {
      USDT.connect(acc1).mint(amount);
      await USDT.connect(acc1).approve(zkOBS.address, amount);
      await zkOBS
        .connect(acc1)
        .registerERC20(pubKeyX, pubKeyY, USDT.address, amount);
    });

    it('Commit', async function () {
      const newBlocks: ZkOBS.CommitBlockStruct[] = [];
      let testData = data[testCaseId];
      let commitBlock: ZkOBS.CommitBlockStruct = {
        blockNumber: BigNumber.from(lastCommittedBlock.blockNumber).add(1),
        newStateRoot: testData.commitmentData.newStateRoot,
        newTsRoot: testData.commitmentData.newTsRoot,
        publicData: testData.commitmentData.o_chunk,
        publicDataOffsets: getPubDataOffset(
          testData.commitmentData.isCriticalChunk,
        ),
        timestamp: Date.now(),
      };
      newBlocks.push(commitBlock);
      let commitmentHash = stateToCommitment(testData.commitmentData);
      let storedBlock: ZkOBS.StoredBlockStruct = {
        blockNumber: commitBlock.blockNumber,
        l1RequestNum: 2,
        pendingRollupTxHash: emptyHash,
        commitment: commitmentHash,
        stateRoot: commitBlock.newStateRoot,
        timestamp: commitBlock.timestamp,
      };
      storedBlocks.push(storedBlock);

      const oriCommittedBlockNum = await zkOBS.committedBlockNum();
      const oriCommittedL1RequestNum = await zkOBS.committedL1RequestNum();
      await zkOBS.commitBlocks(lastCommittedBlock, newBlocks);
      lastCommittedBlock = storedBlocks[storedBlocks.length - 1];
      const newCommittedBlockNum = await zkOBS.committedBlockNum();
      const newCommittedL1RequestNum = await zkOBS.committedL1RequestNum();

      let committedL1RequestNum = BigNumber.from(`0`);
      for (let i = 0; i < newBlocks.length; i++) {
        committedL1RequestNum = committedL1RequestNum.add(
          lastCommittedBlock.l1RequestNum,
        );
      }

      expect(newCommittedBlockNum - oriCommittedBlockNum).to.be.eq(
        newBlocks.length,
      );
      expect(newCommittedL1RequestNum.sub(oriCommittedL1RequestNum)).to.be.eq(
        committedL1RequestNum,
      );
    });

    it('Prove', async function () {
      const committedBlocks: ZkOBS.StoredBlockStruct[] = [];
      let testData = data[testCaseId];
      committedBlocks.push(lastCommittedBlock);
      provedBlockNum++;

      const proofs: ZkOBS.ProofStruct[] = [];
      testData = data[testCaseId];
      let proof_a = testData.callData[0];
      let proof_b = testData.callData[1];
      let proof_c = testData.callData[2];
      let proof_commitment = testData.callData[3];
      let proof: ZkOBS.ProofStruct = {
        a: [proof_a[0], proof_a[1]],
        b: [
          [proof_b[0][0], proof_b[0][1]],
          [proof_b[1][0], proof_b[1][1]],
        ],
        c: [proof_c[0], proof_c[1]],
        commitment: proof_commitment,
      };
      proofs.push(proof);

      const oriProvedBlockNum = await zkOBS.provedBlockNum();
      await zkOBS.proveBlocks(committedBlocks, proofs);
      const newProvedBlockNum = await zkOBS.provedBlockNum();
      expect(newProvedBlockNum - oriProvedBlockNum).to.be.eq(
        committedBlocks.length,
      );
    });

    it('Execute', async function () {
      let pendingBlocks: ZkOBS.ExecuteBlockStruct[] = [];
      let pendingRollupTxPubdata: any[] = [];
      const executeBlock: ZkOBS.ExecuteBlockStruct = {
        storedBlock: lastCommittedBlock,
        pendingRollupTxPubdata: pendingRollupTxPubdata,
      };
      pendingBlocks.push(executeBlock);

      const oriExecutedBlockNum = await zkOBS.executedBlockNum();
      const oriFirstL1RequestId = await zkOBS.firstL1RequestId();
      const oriCommittedL1RequestNum = await zkOBS.committedL1RequestNum();
      const oriPendingL1RequestNum = await zkOBS.pendingL1RequestNum();
      await zkOBS.executeBlocks(pendingBlocks);
      const newExecutedBlockNum = await zkOBS.executedBlockNum();
      const newFirstL1RequestId = await zkOBS.firstL1RequestId();
      const newCommittedL1RequestNum = await zkOBS.committedL1RequestNum();
      const newPendingL1RequestNum = await zkOBS.pendingL1RequestNum();

      let executedL1RequestNum = BigNumber.from(`0`);
      for (let i = 0; i < pendingBlocks.length; i++) {
        executedL1RequestNum = executedL1RequestNum.add(
          pendingBlocks[i].storedBlock.l1RequestNum,
        );
      }

      expect(newExecutedBlockNum - oriExecutedBlockNum).to.be.eq(
        pendingBlocks.length,
      );
      expect(newFirstL1RequestId.sub(oriFirstL1RequestId)).to.be.eq(
        executedL1RequestNum,
      );
      expect(newCommittedL1RequestNum.sub(oriCommittedL1RequestNum)).to.be.eq(
        -executedL1RequestNum,
      );
      expect(newPendingL1RequestNum.sub(oriPendingL1RequestNum)).to.be.eq(
        -executedL1RequestNum,
      );
    });
  });

  describe('Deposit Acc1 with USDT', function () {
    const testCaseId = 2;
    const testData = data[testCaseId];
    const [pubKeyX, pubKeyY] = testData.inputs.tsPubKey[0];

    it('Mimic Deposit', async function () {
      let amount;
      for (let i = 0; i < testData.inputs.reqData.length; i++) {
        amount = testData.inputs.reqData[i][3];
        if (amount != 0) {
          USDT.connect(acc1).mint(amount);
          await USDT.connect(acc1).approve(zkOBS.address, amount);
          await zkOBS.connect(acc1).depositERC20(USDT.address, amount);
        }
      }
    });

    it('Commit', async function () {
      const newBlocks: ZkOBS.CommitBlockStruct[] = [];
      let testData = data[testCaseId];
      let commitBlock: ZkOBS.CommitBlockStruct = {
        blockNumber: BigNumber.from(lastCommittedBlock.blockNumber).add(1),
        newStateRoot: testData.commitmentData.newStateRoot,
        newTsRoot: testData.commitmentData.newTsRoot,
        publicData: testData.commitmentData.o_chunk,
        publicDataOffsets: getPubDataOffset(
          testData.commitmentData.isCriticalChunk,
        ),
        timestamp: Date.now(),
      };
      newBlocks.push(commitBlock);
      let commitmentHash = stateToCommitment(testData.commitmentData);
      let storedBlock: ZkOBS.StoredBlockStruct = {
        blockNumber: commitBlock.blockNumber,
        l1RequestNum: 3,
        pendingRollupTxHash: emptyHash,
        commitment: commitmentHash,
        stateRoot: commitBlock.newStateRoot,
        timestamp: commitBlock.timestamp,
      };
      storedBlocks.push(storedBlock);

      const oriCommittedBlockNum = await zkOBS.committedBlockNum();
      const oriCommittedL1RequestNum = await zkOBS.committedL1RequestNum();
      await zkOBS.commitBlocks(lastCommittedBlock, newBlocks);
      lastCommittedBlock = storedBlocks[storedBlocks.length - 1];
      const newCommittedBlockNum = await zkOBS.committedBlockNum();
      const newCommittedL1RequestNum = await zkOBS.committedL1RequestNum();

      let committedL1RequestNum = BigNumber.from(`0`);
      for (let i = 0; i < newBlocks.length; i++) {
        committedL1RequestNum = committedL1RequestNum.add(
          lastCommittedBlock.l1RequestNum,
        );
      }

      expect(newCommittedBlockNum - oriCommittedBlockNum).to.be.eq(
        newBlocks.length,
      );
      expect(newCommittedL1RequestNum.sub(oriCommittedL1RequestNum)).to.be.eq(
        committedL1RequestNum,
      );
    });

    it('Prove', async function () {
      const committedBlocks: ZkOBS.StoredBlockStruct[] = [];
      let testData = data[testCaseId];
      committedBlocks.push(lastCommittedBlock);
      provedBlockNum++;

      const proofs: ZkOBS.ProofStruct[] = [];
      testData = data[testCaseId];
      let proof_a = testData.callData[0];
      let proof_b = testData.callData[1];
      let proof_c = testData.callData[2];
      let proof_commitment = testData.callData[3];
      let proof: ZkOBS.ProofStruct = {
        a: [proof_a[0], proof_a[1]],
        b: [
          [proof_b[0][0], proof_b[0][1]],
          [proof_b[1][0], proof_b[1][1]],
        ],
        c: [proof_c[0], proof_c[1]],
        commitment: proof_commitment,
      };
      proofs.push(proof);

      const oriProvedBlockNum = await zkOBS.provedBlockNum();
      await zkOBS.proveBlocks(committedBlocks, proofs);
      const newProvedBlockNum = await zkOBS.provedBlockNum();
      expect(newProvedBlockNum - oriProvedBlockNum).to.be.eq(
        committedBlocks.length,
      );
    });

    it('Execute', async function () {
      let pendingBlocks: ZkOBS.ExecuteBlockStruct[] = [];
      let pendingRollupTxPubdata: any[] = [];
      const executeBlock: ZkOBS.ExecuteBlockStruct = {
        storedBlock: lastCommittedBlock,
        pendingRollupTxPubdata: pendingRollupTxPubdata,
      };
      pendingBlocks.push(executeBlock);

      const oriExecutedBlockNum = await zkOBS.executedBlockNum();
      const oriFirstL1RequestId = await zkOBS.firstL1RequestId();
      const oriCommittedL1RequestNum = await zkOBS.committedL1RequestNum();
      const oriPendingL1RequestNum = await zkOBS.pendingL1RequestNum();
      await zkOBS.executeBlocks(pendingBlocks);
      const newExecutedBlockNum = await zkOBS.executedBlockNum();
      const newFirstL1RequestId = await zkOBS.firstL1RequestId();
      const newCommittedL1RequestNum = await zkOBS.committedL1RequestNum();
      const newPendingL1RequestNum = await zkOBS.pendingL1RequestNum();

      let executedL1RequestNum = BigNumber.from(`0`);
      for (let i = 0; i < pendingBlocks.length; i++) {
        executedL1RequestNum = executedL1RequestNum.add(
          pendingBlocks[i].storedBlock.l1RequestNum,
        );
      }

      expect(newExecutedBlockNum - oriExecutedBlockNum).to.be.eq(
        pendingBlocks.length,
      );
      expect(newFirstL1RequestId.sub(oriFirstL1RequestId)).to.be.eq(
        executedL1RequestNum,
      );
      expect(newCommittedL1RequestNum.sub(oriCommittedL1RequestNum)).to.be.eq(
        -executedL1RequestNum,
      );
      expect(newPendingL1RequestNum.sub(oriPendingL1RequestNum)).to.be.eq(
        -executedL1RequestNum,
      );
    });
  });

  describe('Register Acc2 with ETH', function () {
    const testCaseId = 3;
    const testData = data[testCaseId];
    const [pubKeyX, pubKeyY] = testData.inputs.tsPubKey[0];
    const amount = testData.inputs.reqData[1][3];

    it('Mimic Register', async function () {
      await zkOBS
        .connect(acc2)
        .registerETH(pubKeyX, pubKeyY, { value: amount });
    });

    it('Commit', async function () {
      const newBlocks: ZkOBS.CommitBlockStruct[] = [];
      let commitBlock: ZkOBS.CommitBlockStruct = {
        blockNumber: BigNumber.from(lastCommittedBlock.blockNumber).add(1),
        newStateRoot: testData.commitmentData.newStateRoot,
        newTsRoot: testData.commitmentData.newTsRoot,
        publicData: testData.commitmentData.o_chunk,
        publicDataOffsets: getPubDataOffset(
          testData.commitmentData.isCriticalChunk,
        ),
        timestamp: Date.now(),
      };
      newBlocks.push(commitBlock);
      let commitmentHash = stateToCommitment(testData.commitmentData);
      let storedBlock: ZkOBS.StoredBlockStruct = {
        blockNumber: commitBlock.blockNumber,
        l1RequestNum: 2,
        pendingRollupTxHash: emptyHash,
        commitment: commitmentHash,
        stateRoot: commitBlock.newStateRoot,
        timestamp: commitBlock.timestamp,
      };
      storedBlocks.push(storedBlock);

      const oriCommittedBlockNum = await zkOBS.committedBlockNum();
      const oriCommittedL1RequestNum = await zkOBS.committedL1RequestNum();
      await zkOBS.commitBlocks(lastCommittedBlock, newBlocks);
      lastCommittedBlock = storedBlocks[storedBlocks.length - 1];
      const newCommittedBlockNum = await zkOBS.committedBlockNum();
      const newCommittedL1RequestNum = await zkOBS.committedL1RequestNum();

      let committedL1RequestNum = BigNumber.from(`0`);
      for (let i = 0; i < newBlocks.length; i++) {
        committedL1RequestNum = committedL1RequestNum.add(
          lastCommittedBlock.l1RequestNum,
        );
      }

      expect(newCommittedBlockNum - oriCommittedBlockNum).to.be.eq(
        newBlocks.length,
      );
      expect(newCommittedL1RequestNum.sub(oriCommittedL1RequestNum)).to.be.eq(
        committedL1RequestNum,
      );
    });

    it('Prove', async function () {
      const committedBlocks: ZkOBS.StoredBlockStruct[] = [];
      committedBlocks.push(lastCommittedBlock);
      provedBlockNum++;

      const proofs: ZkOBS.ProofStruct[] = [];
      let proof_a = testData.callData[0];
      let proof_b = testData.callData[1];
      let proof_c = testData.callData[2];
      let proof_commitment = testData.callData[3];
      let proof: ZkOBS.ProofStruct = {
        a: [proof_a[0], proof_a[1]],
        b: [
          [proof_b[0][0], proof_b[0][1]],
          [proof_b[1][0], proof_b[1][1]],
        ],
        c: [proof_c[0], proof_c[1]],
        commitment: proof_commitment,
      };
      proofs.push(proof);

      const oriProvedBlockNum = await zkOBS.provedBlockNum();
      await zkOBS.proveBlocks(committedBlocks, proofs);
      const newProvedBlockNum = await zkOBS.provedBlockNum();
      expect(newProvedBlockNum - oriProvedBlockNum).to.be.eq(
        committedBlocks.length,
      );
    });

    it('Execute', async function () {
      let pendingBlocks: ZkOBS.ExecuteBlockStruct[] = [];
      let pendingRollupTxPubdata: any[] = [];
      const executeBlock: ZkOBS.ExecuteBlockStruct = {
        storedBlock: lastCommittedBlock,
        pendingRollupTxPubdata: pendingRollupTxPubdata,
      };
      pendingBlocks.push(executeBlock);

      const oriExecutedBlockNum = await zkOBS.executedBlockNum();
      const oriFirstL1RequestId = await zkOBS.firstL1RequestId();
      const oriCommittedL1RequestNum = await zkOBS.committedL1RequestNum();
      const oriPendingL1RequestNum = await zkOBS.pendingL1RequestNum();
      await zkOBS.executeBlocks(pendingBlocks);
      const newExecutedBlockNum = await zkOBS.executedBlockNum();
      const newFirstL1RequestId = await zkOBS.firstL1RequestId();
      const newCommittedL1RequestNum = await zkOBS.committedL1RequestNum();
      const newPendingL1RequestNum = await zkOBS.pendingL1RequestNum();

      let executedL1RequestNum = BigNumber.from(`0`);
      for (let i = 0; i < pendingBlocks.length; i++) {
        executedL1RequestNum = executedL1RequestNum.add(
          pendingBlocks[i].storedBlock.l1RequestNum,
        );
      }

      expect(newExecutedBlockNum - oriExecutedBlockNum).to.be.eq(
        pendingBlocks.length,
      );
      expect(newFirstL1RequestId.sub(oriFirstL1RequestId)).to.be.eq(
        executedL1RequestNum,
      );
      expect(newCommittedL1RequestNum.sub(oriCommittedL1RequestNum)).to.be.eq(
        -executedL1RequestNum,
      );
      expect(newPendingL1RequestNum.sub(oriPendingL1RequestNum)).to.be.eq(
        -executedL1RequestNum,
      );
    });
  });

  describe('Deposit Acc2 with ETH', function () {
    const testCaseId = 4;
    const testData = data[testCaseId];

    it('Mimic Deposit', async function () {
      let amount;
      for (let i = 0; i < testData.inputs.reqData.length; i++) {
        amount = testData.inputs.reqData[i][3];
        if (amount != 0) {
          await zkOBS.connect(acc2).depositETH({ value: amount });
        }
      }
    });

    it('Commit', async function () {
      const newBlocks: ZkOBS.CommitBlockStruct[] = [];
      let testData = data[testCaseId];
      let commitBlock: ZkOBS.CommitBlockStruct = {
        blockNumber: BigNumber.from(lastCommittedBlock.blockNumber).add(1),
        newStateRoot: testData.commitmentData.newStateRoot,
        newTsRoot: testData.commitmentData.newTsRoot,
        publicData: testData.commitmentData.o_chunk,
        publicDataOffsets: getPubDataOffset(
          testData.commitmentData.isCriticalChunk,
        ),
        timestamp: Date.now(),
      };
      newBlocks.push(commitBlock);
      let commitmentHash = stateToCommitment(testData.commitmentData);
      let storedBlock: ZkOBS.StoredBlockStruct = {
        blockNumber: commitBlock.blockNumber,
        l1RequestNum: 3,
        pendingRollupTxHash: emptyHash,
        commitment: commitmentHash,
        stateRoot: commitBlock.newStateRoot,
        timestamp: commitBlock.timestamp,
      };
      storedBlocks.push(storedBlock);

      const oriCommittedBlockNum = await zkOBS.committedBlockNum();
      const oriCommittedL1RequestNum = await zkOBS.committedL1RequestNum();
      await zkOBS.commitBlocks(lastCommittedBlock, newBlocks);
      lastCommittedBlock = storedBlocks[storedBlocks.length - 1];
      const newCommittedBlockNum = await zkOBS.committedBlockNum();
      const newCommittedL1RequestNum = await zkOBS.committedL1RequestNum();

      let committedL1RequestNum = BigNumber.from(`0`);
      for (let i = 0; i < newBlocks.length; i++) {
        committedL1RequestNum = committedL1RequestNum.add(
          lastCommittedBlock.l1RequestNum,
        );
      }

      expect(newCommittedBlockNum - oriCommittedBlockNum).to.be.eq(
        newBlocks.length,
      );
      expect(newCommittedL1RequestNum.sub(oriCommittedL1RequestNum)).to.be.eq(
        committedL1RequestNum,
      );
    });

    it('Prove', async function () {
      const committedBlocks: ZkOBS.StoredBlockStruct[] = [];
      let testData = data[testCaseId];
      committedBlocks.push(lastCommittedBlock);
      provedBlockNum++;

      const proofs: ZkOBS.ProofStruct[] = [];
      testData = data[testCaseId];
      let proof_a = testData.callData[0];
      let proof_b = testData.callData[1];
      let proof_c = testData.callData[2];
      let proof_commitment = testData.callData[3];
      let proof: ZkOBS.ProofStruct = {
        a: [proof_a[0], proof_a[1]],
        b: [
          [proof_b[0][0], proof_b[0][1]],
          [proof_b[1][0], proof_b[1][1]],
        ],
        c: [proof_c[0], proof_c[1]],
        commitment: proof_commitment,
      };
      proofs.push(proof);

      const oriProvedBlockNum = await zkOBS.provedBlockNum();
      await zkOBS.proveBlocks(committedBlocks, proofs);
      const newProvedBlockNum = await zkOBS.provedBlockNum();
      expect(newProvedBlockNum - oriProvedBlockNum).to.be.eq(
        committedBlocks.length,
      );
    });

    it('Execute', async function () {
      let pendingBlocks: ZkOBS.ExecuteBlockStruct[] = [];
      let pendingRollupTxPubdata: any[] = [];
      const executeBlock: ZkOBS.ExecuteBlockStruct = {
        storedBlock: lastCommittedBlock,
        pendingRollupTxPubdata: pendingRollupTxPubdata,
      };
      pendingBlocks.push(executeBlock);

      const oriExecutedBlockNum = await zkOBS.executedBlockNum();
      const oriFirstL1RequestId = await zkOBS.firstL1RequestId();
      const oriCommittedL1RequestNum = await zkOBS.committedL1RequestNum();
      const oriPendingL1RequestNum = await zkOBS.pendingL1RequestNum();
      await zkOBS.executeBlocks(pendingBlocks);
      const newExecutedBlockNum = await zkOBS.executedBlockNum();
      const newFirstL1RequestId = await zkOBS.firstL1RequestId();
      const newCommittedL1RequestNum = await zkOBS.committedL1RequestNum();
      const newPendingL1RequestNum = await zkOBS.pendingL1RequestNum();

      let executedL1RequestNum = BigNumber.from(`0`);
      for (let i = 0; i < pendingBlocks.length; i++) {
        executedL1RequestNum = executedL1RequestNum.add(
          pendingBlocks[i].storedBlock.l1RequestNum,
        );
      }

      expect(newExecutedBlockNum - oriExecutedBlockNum).to.be.eq(
        pendingBlocks.length,
      );
      expect(newFirstL1RequestId.sub(oriFirstL1RequestId)).to.be.eq(
        executedL1RequestNum,
      );
      expect(newCommittedL1RequestNum.sub(oriCommittedL1RequestNum)).to.be.eq(
        -executedL1RequestNum,
      );
      expect(newPendingL1RequestNum.sub(oriPendingL1RequestNum)).to.be.eq(
        -executedL1RequestNum,
      );
    });
  });

  describe('Withdraw Acc1 with USDT', function () {
    const testCaseId = 5;
    const testData = data[testCaseId];

    it('Commit', async function () {
      const newBlocks: ZkOBS.CommitBlockStruct[] = [];
      let commitBlock: ZkOBS.CommitBlockStruct = {
        blockNumber: BigNumber.from(lastCommittedBlock.blockNumber).add(1),
        newStateRoot: testData.commitmentData.newStateRoot,
        newTsRoot: testData.commitmentData.newTsRoot,
        publicData: testData.commitmentData.o_chunk,
        publicDataOffsets: getPubDataOffset(
          testData.commitmentData.isCriticalChunk,
        ),
        timestamp: Date.now(),
      };
      newBlocks.push(commitBlock);
      let commitmentHash = stateToCommitment(testData.commitmentData);
      let pendingRollupTxHash = emptyHash;
      let accountId;
      let tokenId;
      let amount;
      let pubdata;
      let opType;
      for (let i = 0; i < testData.inputs.reqData.length; i++) {
        opType = testData.inputs.reqData[i][0];
        if (opType != 0) {
          accountId = testData.inputs.reqData[i][1];
          tokenId = testData.inputs.reqData[i][2];
          amount = testData.inputs.reqData[i][3];
          pubdata = ethers.utils
            .solidityPack(
              ['uint8', 'uint32', 'uint16', 'uint128'],
              [OpType.WITHDRAW, accountId, tokenId, amount],
            )
            .padEnd((2 * 12 * 8) / 4 + 2, '0');
          pendingRollupTxHash = ethers.utils.keccak256(
            ethers.utils.solidityPack(
              ['bytes32', 'bytes'],
              [pendingRollupTxHash, pubdata],
            ),
          );
        }
      }

      let storedBlock: ZkOBS.StoredBlockStruct = {
        blockNumber: commitBlock.blockNumber,
        l1RequestNum: 0,
        pendingRollupTxHash: pendingRollupTxHash,
        commitment: commitmentHash,
        stateRoot: commitBlock.newStateRoot,
        timestamp: commitBlock.timestamp,
      };
      storedBlocks.push(storedBlock);

      const oriCommittedBlockNum = await zkOBS.committedBlockNum();
      const oriCommittedL1RequestNum = await zkOBS.committedL1RequestNum();
      await zkOBS.commitBlocks(lastCommittedBlock, newBlocks);
      lastCommittedBlock = storedBlocks[storedBlocks.length - 1];
      const newCommittedBlockNum = await zkOBS.committedBlockNum();
      const newCommittedL1RequestNum = await zkOBS.committedL1RequestNum();

      let committedL1RequestNum = BigNumber.from(`0`);
      for (let i = 0; i < newBlocks.length; i++) {
        committedL1RequestNum = committedL1RequestNum.add(
          lastCommittedBlock.l1RequestNum,
        );
      }

      expect(newCommittedBlockNum - oriCommittedBlockNum).to.be.eq(
        newBlocks.length,
      );
      expect(newCommittedL1RequestNum.sub(oriCommittedL1RequestNum)).to.be.eq(
        committedL1RequestNum,
      );
    });

    it('Prove', async function () {
      const committedBlocks: ZkOBS.StoredBlockStruct[] = [];
      committedBlocks.push(lastCommittedBlock);
      provedBlockNum++;

      const proofs: ZkOBS.ProofStruct[] = [];
      let proof_a = testData.callData[0];
      let proof_b = testData.callData[1];
      let proof_c = testData.callData[2];
      let proof_commitment = testData.callData[3];
      let proof: ZkOBS.ProofStruct = {
        a: [proof_a[0], proof_a[1]],
        b: [
          [proof_b[0][0], proof_b[0][1]],
          [proof_b[1][0], proof_b[1][1]],
        ],
        c: [proof_c[0], proof_c[1]],
        commitment: proof_commitment,
      };
      proofs.push(proof);

      const oriProvedBlockNum = await zkOBS.provedBlockNum();
      await zkOBS.proveBlocks(committedBlocks, proofs);
      const newProvedBlockNum = await zkOBS.provedBlockNum();
      expect(newProvedBlockNum - oriProvedBlockNum).to.be.eq(
        committedBlocks.length,
      );
    });

    it('Execute', async function () {
      let pendingBlocks: ZkOBS.ExecuteBlockStruct[] = [];
      let pendingRollupTxPubdata: any[] = [];
      let accountId;
      let tokenId;
      let amount;
      let pubdata;
      let opType;
      for (let i = 0; i < testData.inputs.reqData.length; i++) {
        opType = testData.inputs.reqData[i][0];
        if (opType != 0) {
          accountId = testData.inputs.reqData[i][1];
          tokenId = testData.inputs.reqData[i][2];
          amount = testData.inputs.reqData[i][3];
          pubdata = ethers.utils
            .solidityPack(
              ['uint8', 'uint32', 'uint16', 'uint128'],
              [OpType.WITHDRAW, accountId, tokenId, amount],
            )
            .padEnd((2 * 12 * 8) / 4 + 2, '0');
          pendingRollupTxPubdata.push(pubdata);
        }
      }
      const executeBlock: ZkOBS.ExecuteBlockStruct = {
        storedBlock: lastCommittedBlock,
        pendingRollupTxPubdata: pendingRollupTxPubdata,
      };
      pendingBlocks.push(executeBlock);

      const oriExecutedBlockNum = await zkOBS.executedBlockNum();
      const oriFirstL1RequestId = await zkOBS.firstL1RequestId();
      const oriCommittedL1RequestNum = await zkOBS.committedL1RequestNum();
      const oriPendingL1RequestNum = await zkOBS.pendingL1RequestNum();
      await zkOBS.executeBlocks(pendingBlocks);
      const newExecutedBlockNum = await zkOBS.executedBlockNum();
      const newFirstL1RequestId = await zkOBS.firstL1RequestId();
      const newCommittedL1RequestNum = await zkOBS.committedL1RequestNum();
      const newPendingL1RequestNum = await zkOBS.pendingL1RequestNum();

      let executedL1RequestNum = BigNumber.from(`0`);
      for (let i = 0; i < pendingBlocks.length; i++) {
        executedL1RequestNum = executedL1RequestNum.add(
          pendingBlocks[i].storedBlock.l1RequestNum,
        );
      }

      expect(newExecutedBlockNum - oriExecutedBlockNum).to.be.eq(
        pendingBlocks.length,
      );
      expect(newFirstL1RequestId.sub(oriFirstL1RequestId)).to.be.eq(
        executedL1RequestNum,
      );
      expect(newCommittedL1RequestNum.sub(oriCommittedL1RequestNum)).to.be.eq(
        -executedL1RequestNum,
      );
      expect(newPendingL1RequestNum.sub(oriPendingL1RequestNum)).to.be.eq(
        -executedL1RequestNum,
      );
    });

    it('L1 Withdraw', async function () {
      let accountId;
      let tokenId;
      let tokenAddr;
      let amount;
      let opType;
      for (let i = 0; i < testData.inputs.reqData.length; i++) {
        opType = testData.inputs.reqData[i][0];
        if (opType != 0) {
          accountId = testData.inputs.reqData[i][1];
          tokenId = testData.inputs.reqData[i][2];
          amount = testData.inputs.reqData[i][3];
          tokenAddr = zkOBS.tokenAddrOf(tokenId);
          zkOBS.connect(acc1).withdrawERC20(tokenAddr, amount);
        }
      }
    });
  });

  describe('Auction order Acc1', function () {
    const testCaseId = 6;
    const testData = data[testCaseId];

    it('Commit', async function () {
      const newBlocks: ZkOBS.CommitBlockStruct[] = [];
      let commitBlock: ZkOBS.CommitBlockStruct = {
        blockNumber: BigNumber.from(lastCommittedBlock.blockNumber).add(1),
        newStateRoot: testData.commitmentData.newStateRoot,
        newTsRoot: testData.commitmentData.newTsRoot,
        publicData: testData.commitmentData.o_chunk,
        publicDataOffsets: getPubDataOffset(
          testData.commitmentData.isCriticalChunk,
        ),
        timestamp: Date.now(),
      };
      newBlocks.push(commitBlock);
      let commitmentHash = stateToCommitment(testData.commitmentData);

      let storedBlock: ZkOBS.StoredBlockStruct = {
        blockNumber: commitBlock.blockNumber,
        l1RequestNum: 0,
        pendingRollupTxHash: emptyHash,
        commitment: commitmentHash,
        stateRoot: commitBlock.newStateRoot,
        timestamp: commitBlock.timestamp,
      };
      storedBlocks.push(storedBlock);

      const oriCommittedBlockNum = await zkOBS.committedBlockNum();
      const oriCommittedL1RequestNum = await zkOBS.committedL1RequestNum();
      await zkOBS.commitBlocks(lastCommittedBlock, newBlocks);
      lastCommittedBlock = storedBlocks[storedBlocks.length - 1];
      const newCommittedBlockNum = await zkOBS.committedBlockNum();
      const newCommittedL1RequestNum = await zkOBS.committedL1RequestNum();

      let committedL1RequestNum = BigNumber.from(`0`);
      for (let i = 0; i < newBlocks.length; i++) {
        committedL1RequestNum = committedL1RequestNum.add(
          lastCommittedBlock.l1RequestNum,
        );
      }

      expect(newCommittedBlockNum - oriCommittedBlockNum).to.be.eq(
        newBlocks.length,
      );
      expect(newCommittedL1RequestNum.sub(oriCommittedL1RequestNum)).to.be.eq(
        committedL1RequestNum,
      );
    });

    it('Prove', async function () {
      const committedBlocks: ZkOBS.StoredBlockStruct[] = [];
      committedBlocks.push(lastCommittedBlock);
      provedBlockNum++;

      const proofs: ZkOBS.ProofStruct[] = [];
      let proof_a = testData.callData[0];
      let proof_b = testData.callData[1];
      let proof_c = testData.callData[2];
      let proof_commitment = testData.callData[3];
      let proof: ZkOBS.ProofStruct = {
        a: [proof_a[0], proof_a[1]],
        b: [
          [proof_b[0][0], proof_b[0][1]],
          [proof_b[1][0], proof_b[1][1]],
        ],
        c: [proof_c[0], proof_c[1]],
        commitment: proof_commitment,
      };
      proofs.push(proof);

      const oriProvedBlockNum = await zkOBS.provedBlockNum();
      await zkOBS.proveBlocks(committedBlocks, proofs);
      const newProvedBlockNum = await zkOBS.provedBlockNum();
      expect(newProvedBlockNum - oriProvedBlockNum).to.be.eq(
        committedBlocks.length,
      );
    });

    it('Execute', async function () {
      let pendingBlocks: ZkOBS.ExecuteBlockStruct[] = [];
      let pendingRollupTxPubdata: any[] = [];

      const executeBlock: ZkOBS.ExecuteBlockStruct = {
        storedBlock: lastCommittedBlock,
        pendingRollupTxPubdata: pendingRollupTxPubdata,
      };
      pendingBlocks.push(executeBlock);

      const oriExecutedBlockNum = await zkOBS.executedBlockNum();
      const oriFirstL1RequestId = await zkOBS.firstL1RequestId();
      const oriCommittedL1RequestNum = await zkOBS.committedL1RequestNum();
      const oriPendingL1RequestNum = await zkOBS.pendingL1RequestNum();
      await zkOBS.executeBlocks(pendingBlocks);
      const newExecutedBlockNum = await zkOBS.executedBlockNum();
      const newFirstL1RequestId = await zkOBS.firstL1RequestId();
      const newCommittedL1RequestNum = await zkOBS.committedL1RequestNum();
      const newPendingL1RequestNum = await zkOBS.pendingL1RequestNum();

      let executedL1RequestNum = BigNumber.from(`0`);
      for (let i = 0; i < pendingBlocks.length; i++) {
        executedL1RequestNum = executedL1RequestNum.add(
          pendingBlocks[i].storedBlock.l1RequestNum,
        );
      }

      expect(newExecutedBlockNum - oriExecutedBlockNum).to.be.eq(
        pendingBlocks.length,
      );
      expect(newFirstL1RequestId.sub(oriFirstL1RequestId)).to.be.eq(
        executedL1RequestNum,
      );
      expect(newCommittedL1RequestNum.sub(oriCommittedL1RequestNum)).to.be.eq(
        -executedL1RequestNum,
      );
      expect(newPendingL1RequestNum.sub(oriPendingL1RequestNum)).to.be.eq(
        -executedL1RequestNum,
      );
    });
  });

  describe('Cancel order Acc1', function () {
    const testCaseId = 7;
    const testData = data[testCaseId];

    it('Commit', async function () {
      const newBlocks: ZkOBS.CommitBlockStruct[] = [];
      let commitBlock: ZkOBS.CommitBlockStruct = {
        blockNumber: BigNumber.from(lastCommittedBlock.blockNumber).add(1),
        newStateRoot: testData.commitmentData.newStateRoot,
        newTsRoot: testData.commitmentData.newTsRoot,
        publicData: testData.commitmentData.o_chunk,
        publicDataOffsets: getPubDataOffset(
          testData.commitmentData.isCriticalChunk,
        ),
        timestamp: Date.now(),
      };
      newBlocks.push(commitBlock);
      let commitmentHash = stateToCommitment(testData.commitmentData);

      let storedBlock: ZkOBS.StoredBlockStruct = {
        blockNumber: commitBlock.blockNumber,
        l1RequestNum: 0,
        pendingRollupTxHash: emptyHash,
        commitment: commitmentHash,
        stateRoot: commitBlock.newStateRoot,
        timestamp: commitBlock.timestamp,
      };
      storedBlocks.push(storedBlock);

      const oriCommittedBlockNum = await zkOBS.committedBlockNum();
      const oriCommittedL1RequestNum = await zkOBS.committedL1RequestNum();
      await zkOBS.commitBlocks(lastCommittedBlock, newBlocks);
      lastCommittedBlock = storedBlocks[storedBlocks.length - 1];
      const newCommittedBlockNum = await zkOBS.committedBlockNum();
      const newCommittedL1RequestNum = await zkOBS.committedL1RequestNum();

      let committedL1RequestNum = BigNumber.from(`0`);
      for (let i = 0; i < newBlocks.length; i++) {
        committedL1RequestNum = committedL1RequestNum.add(
          lastCommittedBlock.l1RequestNum,
        );
      }

      expect(newCommittedBlockNum - oriCommittedBlockNum).to.be.eq(
        newBlocks.length,
      );
      expect(newCommittedL1RequestNum.sub(oriCommittedL1RequestNum)).to.be.eq(
        committedL1RequestNum,
      );
    });

    it('Prove', async function () {
      const committedBlocks: ZkOBS.StoredBlockStruct[] = [];
      committedBlocks.push(lastCommittedBlock);
      provedBlockNum++;

      const proofs: ZkOBS.ProofStruct[] = [];
      let proof_a = testData.callData[0];
      let proof_b = testData.callData[1];
      let proof_c = testData.callData[2];
      let proof_commitment = testData.callData[3];
      let proof: ZkOBS.ProofStruct = {
        a: [proof_a[0], proof_a[1]],
        b: [
          [proof_b[0][0], proof_b[0][1]],
          [proof_b[1][0], proof_b[1][1]],
        ],
        c: [proof_c[0], proof_c[1]],
        commitment: proof_commitment,
      };
      proofs.push(proof);

      const oriProvedBlockNum = await zkOBS.provedBlockNum();
      await zkOBS.proveBlocks(committedBlocks, proofs);
      const newProvedBlockNum = await zkOBS.provedBlockNum();
      expect(newProvedBlockNum - oriProvedBlockNum).to.be.eq(
        committedBlocks.length,
      );
    });

    it('Execute', async function () {
      let pendingBlocks: ZkOBS.ExecuteBlockStruct[] = [];
      let pendingRollupTxPubdata: any[] = [];

      const executeBlock: ZkOBS.ExecuteBlockStruct = {
        storedBlock: lastCommittedBlock,
        pendingRollupTxPubdata: pendingRollupTxPubdata,
      };
      pendingBlocks.push(executeBlock);

      const oriExecutedBlockNum = await zkOBS.executedBlockNum();
      const oriFirstL1RequestId = await zkOBS.firstL1RequestId();
      const oriCommittedL1RequestNum = await zkOBS.committedL1RequestNum();
      const oriPendingL1RequestNum = await zkOBS.pendingL1RequestNum();
      await zkOBS.executeBlocks(pendingBlocks);
      const newExecutedBlockNum = await zkOBS.executedBlockNum();
      const newFirstL1RequestId = await zkOBS.firstL1RequestId();
      const newCommittedL1RequestNum = await zkOBS.committedL1RequestNum();
      const newPendingL1RequestNum = await zkOBS.pendingL1RequestNum();

      let executedL1RequestNum = BigNumber.from(`0`);
      for (let i = 0; i < pendingBlocks.length; i++) {
        executedL1RequestNum = executedL1RequestNum.add(
          pendingBlocks[i].storedBlock.l1RequestNum,
        );
      }

      expect(newExecutedBlockNum - oriExecutedBlockNum).to.be.eq(
        pendingBlocks.length,
      );
      expect(newFirstL1RequestId.sub(oriFirstL1RequestId)).to.be.eq(
        executedL1RequestNum,
      );
      expect(newCommittedL1RequestNum.sub(oriCommittedL1RequestNum)).to.be.eq(
        -executedL1RequestNum,
      );
      expect(newPendingL1RequestNum.sub(oriPendingL1RequestNum)).to.be.eq(
        -executedL1RequestNum,
      );
    });
  });

  describe('Auction order Acc2', function () {
    const testCaseId = 8;
    const testData = data[testCaseId];

    it('Commit', async function () {
      const newBlocks: ZkOBS.CommitBlockStruct[] = [];
      let commitBlock: ZkOBS.CommitBlockStruct = {
        blockNumber: BigNumber.from(lastCommittedBlock.blockNumber).add(1),
        newStateRoot: testData.commitmentData.newStateRoot,
        newTsRoot: testData.commitmentData.newTsRoot,
        publicData: testData.commitmentData.o_chunk,
        publicDataOffsets: getPubDataOffset(
          testData.commitmentData.isCriticalChunk,
        ),
        timestamp: Date.now(),
      };
      newBlocks.push(commitBlock);
      let commitmentHash = stateToCommitment(testData.commitmentData);

      let storedBlock: ZkOBS.StoredBlockStruct = {
        blockNumber: commitBlock.blockNumber,
        l1RequestNum: 0,
        pendingRollupTxHash: emptyHash,
        commitment: commitmentHash,
        stateRoot: commitBlock.newStateRoot,
        timestamp: commitBlock.timestamp,
      };
      storedBlocks.push(storedBlock);

      const oriCommittedBlockNum = await zkOBS.committedBlockNum();
      const oriCommittedL1RequestNum = await zkOBS.committedL1RequestNum();
      await zkOBS.commitBlocks(lastCommittedBlock, newBlocks);
      lastCommittedBlock = storedBlocks[storedBlocks.length - 1];
      const newCommittedBlockNum = await zkOBS.committedBlockNum();
      const newCommittedL1RequestNum = await zkOBS.committedL1RequestNum();

      let committedL1RequestNum = BigNumber.from(`0`);
      for (let i = 0; i < newBlocks.length; i++) {
        committedL1RequestNum = committedL1RequestNum.add(
          lastCommittedBlock.l1RequestNum,
        );
      }

      expect(newCommittedBlockNum - oriCommittedBlockNum).to.be.eq(
        newBlocks.length,
      );
      expect(newCommittedL1RequestNum.sub(oriCommittedL1RequestNum)).to.be.eq(
        committedL1RequestNum,
      );
    });

    it('Prove', async function () {
      const committedBlocks: ZkOBS.StoredBlockStruct[] = [];
      committedBlocks.push(lastCommittedBlock);
      provedBlockNum++;

      const proofs: ZkOBS.ProofStruct[] = [];
      let proof_a = testData.callData[0];
      let proof_b = testData.callData[1];
      let proof_c = testData.callData[2];
      let proof_commitment = testData.callData[3];
      let proof: ZkOBS.ProofStruct = {
        a: [proof_a[0], proof_a[1]],
        b: [
          [proof_b[0][0], proof_b[0][1]],
          [proof_b[1][0], proof_b[1][1]],
        ],
        c: [proof_c[0], proof_c[1]],
        commitment: proof_commitment,
      };
      proofs.push(proof);

      const oriProvedBlockNum = await zkOBS.provedBlockNum();
      await zkOBS.proveBlocks(committedBlocks, proofs);
      const newProvedBlockNum = await zkOBS.provedBlockNum();
      expect(newProvedBlockNum - oriProvedBlockNum).to.be.eq(
        committedBlocks.length,
      );
    });

    it('Execute', async function () {
      let pendingBlocks: ZkOBS.ExecuteBlockStruct[] = [];
      let pendingRollupTxPubdata: any[] = [];

      const executeBlock: ZkOBS.ExecuteBlockStruct = {
        storedBlock: lastCommittedBlock,
        pendingRollupTxPubdata: pendingRollupTxPubdata,
      };
      pendingBlocks.push(executeBlock);

      const oriExecutedBlockNum = await zkOBS.executedBlockNum();
      const oriFirstL1RequestId = await zkOBS.firstL1RequestId();
      const oriCommittedL1RequestNum = await zkOBS.committedL1RequestNum();
      const oriPendingL1RequestNum = await zkOBS.pendingL1RequestNum();
      await zkOBS.executeBlocks(pendingBlocks);
      const newExecutedBlockNum = await zkOBS.executedBlockNum();
      const newFirstL1RequestId = await zkOBS.firstL1RequestId();
      const newCommittedL1RequestNum = await zkOBS.committedL1RequestNum();
      const newPendingL1RequestNum = await zkOBS.pendingL1RequestNum();

      let executedL1RequestNum = BigNumber.from(`0`);
      for (let i = 0; i < pendingBlocks.length; i++) {
        executedL1RequestNum = executedL1RequestNum.add(
          pendingBlocks[i].storedBlock.l1RequestNum,
        );
      }

      expect(newExecutedBlockNum - oriExecutedBlockNum).to.be.eq(
        pendingBlocks.length,
      );
      expect(newFirstL1RequestId.sub(oriFirstL1RequestId)).to.be.eq(
        executedL1RequestNum,
      );
      expect(newCommittedL1RequestNum.sub(oriCommittedL1RequestNum)).to.be.eq(
        -executedL1RequestNum,
      );
      expect(newPendingL1RequestNum.sub(oriPendingL1RequestNum)).to.be.eq(
        -executedL1RequestNum,
      );
    });
  });

  describe('Cancel order Acc2', function () {
    const testCaseId = 9;
    const testData = data[testCaseId];

    it('Commit', async function () {
      const newBlocks: ZkOBS.CommitBlockStruct[] = [];
      let commitBlock: ZkOBS.CommitBlockStruct = {
        blockNumber: BigNumber.from(lastCommittedBlock.blockNumber).add(1),
        newStateRoot: testData.commitmentData.newStateRoot,
        newTsRoot: testData.commitmentData.newTsRoot,
        publicData: testData.commitmentData.o_chunk,
        publicDataOffsets: getPubDataOffset(
          testData.commitmentData.isCriticalChunk,
        ),
        timestamp: Date.now(),
      };
      newBlocks.push(commitBlock);
      let commitmentHash = stateToCommitment(testData.commitmentData);

      let storedBlock: ZkOBS.StoredBlockStruct = {
        blockNumber: commitBlock.blockNumber,
        l1RequestNum: 0,
        pendingRollupTxHash: emptyHash,
        commitment: commitmentHash,
        stateRoot: commitBlock.newStateRoot,
        timestamp: commitBlock.timestamp,
      };
      storedBlocks.push(storedBlock);

      const oriCommittedBlockNum = await zkOBS.committedBlockNum();
      const oriCommittedL1RequestNum = await zkOBS.committedL1RequestNum();
      await zkOBS.commitBlocks(lastCommittedBlock, newBlocks);
      lastCommittedBlock = storedBlocks[storedBlocks.length - 1];
      const newCommittedBlockNum = await zkOBS.committedBlockNum();
      const newCommittedL1RequestNum = await zkOBS.committedL1RequestNum();

      let committedL1RequestNum = BigNumber.from(`0`);
      for (let i = 0; i < newBlocks.length; i++) {
        committedL1RequestNum = committedL1RequestNum.add(
          lastCommittedBlock.l1RequestNum,
        );
      }

      expect(newCommittedBlockNum - oriCommittedBlockNum).to.be.eq(
        newBlocks.length,
      );
      expect(newCommittedL1RequestNum.sub(oriCommittedL1RequestNum)).to.be.eq(
        committedL1RequestNum,
      );
    });

    it('Prove', async function () {
      const committedBlocks: ZkOBS.StoredBlockStruct[] = [];
      committedBlocks.push(lastCommittedBlock);
      provedBlockNum++;

      const proofs: ZkOBS.ProofStruct[] = [];
      let proof_a = testData.callData[0];
      let proof_b = testData.callData[1];
      let proof_c = testData.callData[2];
      let proof_commitment = testData.callData[3];
      let proof: ZkOBS.ProofStruct = {
        a: [proof_a[0], proof_a[1]],
        b: [
          [proof_b[0][0], proof_b[0][1]],
          [proof_b[1][0], proof_b[1][1]],
        ],
        c: [proof_c[0], proof_c[1]],
        commitment: proof_commitment,
      };
      proofs.push(proof);

      const oriProvedBlockNum = await zkOBS.provedBlockNum();
      await zkOBS.proveBlocks(committedBlocks, proofs);
      const newProvedBlockNum = await zkOBS.provedBlockNum();
      expect(newProvedBlockNum - oriProvedBlockNum).to.be.eq(
        committedBlocks.length,
      );
    });

    it('Execute', async function () {
      let pendingBlocks: ZkOBS.ExecuteBlockStruct[] = [];
      let pendingRollupTxPubdata: any[] = [];

      const executeBlock: ZkOBS.ExecuteBlockStruct = {
        storedBlock: lastCommittedBlock,
        pendingRollupTxPubdata: pendingRollupTxPubdata,
      };
      pendingBlocks.push(executeBlock);

      const oriExecutedBlockNum = await zkOBS.executedBlockNum();
      const oriFirstL1RequestId = await zkOBS.firstL1RequestId();
      const oriCommittedL1RequestNum = await zkOBS.committedL1RequestNum();
      const oriPendingL1RequestNum = await zkOBS.pendingL1RequestNum();
      await zkOBS.executeBlocks(pendingBlocks);
      const newExecutedBlockNum = await zkOBS.executedBlockNum();
      const newFirstL1RequestId = await zkOBS.firstL1RequestId();
      const newCommittedL1RequestNum = await zkOBS.committedL1RequestNum();
      const newPendingL1RequestNum = await zkOBS.pendingL1RequestNum();

      let executedL1RequestNum = BigNumber.from(`0`);
      for (let i = 0; i < pendingBlocks.length; i++) {
        executedL1RequestNum = executedL1RequestNum.add(
          pendingBlocks[i].storedBlock.l1RequestNum,
        );
      }

      expect(newExecutedBlockNum - oriExecutedBlockNum).to.be.eq(
        pendingBlocks.length,
      );
      expect(newFirstL1RequestId.sub(oriFirstL1RequestId)).to.be.eq(
        executedL1RequestNum,
      );
      expect(newCommittedL1RequestNum.sub(oriCommittedL1RequestNum)).to.be.eq(
        -executedL1RequestNum,
      );
      expect(newPendingL1RequestNum.sub(oriPendingL1RequestNum)).to.be.eq(
        -executedL1RequestNum,
      );
    });
  });

  describe.skip('Auction match', function () {
    const testCaseId = 10;
    const testData = data[testCaseId];

    it('Commit', async function () {
      const newBlocks: ZkOBS.CommitBlockStruct[] = [];
      let commitBlock: ZkOBS.CommitBlockStruct = {
        blockNumber: BigNumber.from(lastCommittedBlock.blockNumber).add(1),
        newStateRoot: testData.commitmentData.newStateRoot,
        newTsRoot: testData.commitmentData.newTsRoot,
        publicData: testData.commitmentData.o_chunk,
        publicDataOffsets: getPubDataOffset(
          testData.commitmentData.isCriticalChunk,
        ),
        timestamp: Date.now(),
      };
      newBlocks.push(commitBlock);
      let commitmentHash = stateToCommitment(testData.commitmentData);
      let pendingRollupTxHash = emptyHash;
      let accountId;
      let collateralId;
      let collateralAmt;
      let debtId;
      let debtAmt;
      let pubdata;
      let opType;
      let maturityTime;
      for (let i = 0; i < testData.inputs.reqData.length; i++) {
        opType = testData.inputs.reqData[i][0];
        if (opType != OpType.AUCTION_END) {
          accountId = testData.inputs.reqData[i][1];
          collateralId = testData.inputs.reqData[i][2];
          collateralAmt = testData.inputs.reqData[i][3];
          debtId = testData.inputs.reqData[i][4];
          debtAmt = testData.inputs.reqData[i][5];
          maturityTime = testData.inputs.reqData[i][6];
          pubdata = ethers.utils
            .solidityPack(
              ['uint8', 'uint32', 'uint16', 'uint128'],
              [OpType.WITHDRAW, accountId, tokenId, amount],
            )
            .padEnd((2 * 12 * 8) / 4 + 2, '0');
          pendingRollupTxHash = ethers.utils.keccak256(
            ethers.utils.solidityPack(
              ['bytes32', 'bytes'],
              [pendingRollupTxHash, pubdata],
            ),
          );
        }
      }
      let storedBlock: ZkOBS.StoredBlockStruct = {
        blockNumber: commitBlock.blockNumber,
        l1RequestNum: 0,
        pendingRollupTxHash: emptyHash,
        commitment: commitmentHash,
        stateRoot: commitBlock.newStateRoot,
        timestamp: commitBlock.timestamp,
      };
      storedBlocks.push(storedBlock);

      const oriCommittedBlockNum = await zkOBS.committedBlockNum();
      const oriCommittedL1RequestNum = await zkOBS.committedL1RequestNum();
      await zkOBS.commitBlocks(lastCommittedBlock, newBlocks);
      lastCommittedBlock = storedBlocks[storedBlocks.length - 1];
      const newCommittedBlockNum = await zkOBS.committedBlockNum();
      const newCommittedL1RequestNum = await zkOBS.committedL1RequestNum();

      let committedL1RequestNum = BigNumber.from(`0`);
      for (let i = 0; i < newBlocks.length; i++) {
        committedL1RequestNum = committedL1RequestNum.add(
          lastCommittedBlock.l1RequestNum,
        );
      }

      expect(newCommittedBlockNum - oriCommittedBlockNum).to.be.eq(
        newBlocks.length,
      );
      expect(newCommittedL1RequestNum.sub(oriCommittedL1RequestNum)).to.be.eq(
        committedL1RequestNum,
      );
    });

    it('Prove', async function () {
      const committedBlocks: ZkOBS.StoredBlockStruct[] = [];
      committedBlocks.push(lastCommittedBlock);
      provedBlockNum++;

      const proofs: ZkOBS.ProofStruct[] = [];
      let proof_a = testData.callData[0];
      let proof_b = testData.callData[1];
      let proof_c = testData.callData[2];
      let proof_commitment = testData.callData[3];
      let proof: ZkOBS.ProofStruct = {
        a: [proof_a[0], proof_a[1]],
        b: [
          [proof_b[0][0], proof_b[0][1]],
          [proof_b[1][0], proof_b[1][1]],
        ],
        c: [proof_c[0], proof_c[1]],
        commitment: proof_commitment,
      };
      proofs.push(proof);

      const oriProvedBlockNum = await zkOBS.provedBlockNum();
      await zkOBS.proveBlocks(committedBlocks, proofs);
      const newProvedBlockNum = await zkOBS.provedBlockNum();
      expect(newProvedBlockNum - oriProvedBlockNum).to.be.eq(
        committedBlocks.length,
      );
    });

    it('Execute', async function () {
      let pendingBlocks: ZkOBS.ExecuteBlockStruct[] = [];
      let pendingRollupTxPubdata: any[] = [];

      const executeBlock: ZkOBS.ExecuteBlockStruct = {
        storedBlock: lastCommittedBlock,
        pendingRollupTxPubdata: pendingRollupTxPubdata,
      };
      pendingBlocks.push(executeBlock);

      const oriExecutedBlockNum = await zkOBS.executedBlockNum();
      const oriFirstL1RequestId = await zkOBS.firstL1RequestId();
      const oriCommittedL1RequestNum = await zkOBS.committedL1RequestNum();
      const oriPendingL1RequestNum = await zkOBS.pendingL1RequestNum();
      await zkOBS.executeBlocks(pendingBlocks);
      const newExecutedBlockNum = await zkOBS.executedBlockNum();
      const newFirstL1RequestId = await zkOBS.firstL1RequestId();
      const newCommittedL1RequestNum = await zkOBS.committedL1RequestNum();
      const newPendingL1RequestNum = await zkOBS.pendingL1RequestNum();

      let executedL1RequestNum = BigNumber.from(`0`);
      for (let i = 0; i < pendingBlocks.length; i++) {
        executedL1RequestNum = executedL1RequestNum.add(
          pendingBlocks[i].storedBlock.l1RequestNum,
        );
      }

      expect(newExecutedBlockNum - oriExecutedBlockNum).to.be.eq(
        pendingBlocks.length,
      );
      expect(newFirstL1RequestId.sub(oriFirstL1RequestId)).to.be.eq(
        executedL1RequestNum,
      );
      expect(newCommittedL1RequestNum.sub(oriCommittedL1RequestNum)).to.be.eq(
        -executedL1RequestNum,
      );
      expect(newPendingL1RequestNum.sub(oriPendingL1RequestNum)).to.be.eq(
        -executedL1RequestNum,
      );
    });
  });
});
