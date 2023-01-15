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
import initStates from './demo/initStates.json';
const testDataPath = './test/demo';

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
  let commitBlocks: ZkOBS.CommitBlockStruct[];
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
    } = await loadFixture(deploy);
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
    // await zkOBS.connect(operator).addToken(USDT.address);
    await zkOBS.connect(operator).addToken(USDC.address);
    // await zkOBS.connect(operator).addToken(DAI.address);
  });

  describe('Rollup for Acc1 register with USDC', function () {
    const testCaseId = 0;
    const amount = data[testCaseId + 1].inputs.reqData[testCaseId][3];
    const [pubKeyX, pubKeyY] = data[testCaseId + 1].inputs.tsPubKey[0];
    it('Mimic register', async function () {
      USDC.connect(acc1).mint(amount);
      await USDC.connect(acc1).approve(zkOBS.address, amount);
      await zkOBS
        .connect(acc1)
        .registerERC20(pubKeyX, pubKeyY, USDC.address, amount);
    });
    it('Commit', async function () {
      const newBlocks: ZkOBS.CommitBlockStruct[] = [];
      // block for register
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
      commitBlocks.push(commitBlock);
      //block for deposit
      testData = data[testCaseId + 1];
      commitBlock = {
        blockNumber: BigNumber.from(commitBlock.blockNumber).add(1),
        newStateRoot: testData.commitmentData.newStateRoot,
        newTsRoot: testData.commitmentData.newTsRoot,
        publicData: testData.commitmentData.o_chunk,
        publicDataOffsets: getPubDataOffset(
          testData.commitmentData.isCriticalChunk,
        ),
        timestamp: Date.now(),
      };
      newBlocks.push(commitBlock);
      commitBlocks.push(commitBlock);

      const oriCommittedBlockNum = await zkOBS.committedBlockNum();
      const oriCommittedL1RequestNum = await zkOBS.committedL1RequestNum();
      await zkOBS.commitBlocks(lastCommittedBlock, newBlocks);
      const newCommittedBlockNum = await zkOBS.committedBlockNum();
      const newCommittedL1RequestNum = await zkOBS.committedL1RequestNum();

      expect(newCommittedBlockNum - oriCommittedBlockNum).to.be.eq(
        newBlocks.length,
      );
      expect(newCommittedL1RequestNum.sub(oriCommittedL1RequestNum)).to.be.eq(
        2,
      );
    });
    it('Prove', async function () {
      const committedBlocks: ZkOBS.StoredBlockStruct[] = [];
      let testData = data[testCaseId];
      let commitmentHash = stateToCommitment(testData.commitmentData);
      let committedBlock: ZkOBS.StoredBlockStruct = {
        blockNumber: commitBlocks[provedBlockNum].blockNumber,
        stateRoot: commitBlocks[provedBlockNum].newStateRoot,
        l1RequestNum: 1,
        pendingRollupTxHash: emptyHash,
        commitment: commitmentHash,
        timestamp: commitBlocks[provedBlockNum].newStateRoot,
      };
      committedBlocks.push(committedBlock);
      provedBlockNum++;

      testData = data[testCaseId + 1];
      commitmentHash = stateToCommitment(testData.commitmentData);
      committedBlock = {
        blockNumber: commitBlocks[provedBlockNum].blockNumber,
        stateRoot: commitBlocks[provedBlockNum].newStateRoot,
        l1RequestNum: 1,
        pendingRollupTxHash: emptyHash,
        commitment: commitmentHash,
        timestamp: commitBlocks[provedBlockNum].newStateRoot,
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

      testData = data[testCaseId + 1];
      proof_a = testData.callData[0];
      proof_b = testData.callData[1];
      proof_c = testData.callData[2];
      proof_commitment = testData.callData[3];
      proof = {
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
    it('Execute', async function () {});
  });
});
