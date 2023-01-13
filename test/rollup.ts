import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { deploy, genTsAddr, initTestData } from './utils';
import { OpType } from './Types';
import { emptyHash } from './Config';
import { BigNumber, ethers, Signer } from 'ethers';
import { ERC20FreeMint, WETH9, ZkOBS } from '../typechain-types';
import { expect } from 'chai';

//! Change this for different test data
import initStates from './demo/initStates.json';
import { ZkOBS } from '../backend/ts-contract-types/contracts/ZkOBS';
const testDataPath = './test/demo';

describe('Rollup', function () {
  let operator: Signer;
  let acc1: Signer;
  let acc2: Signer;
  let zkUSDC: ERC20FreeMint;
  let zkOBS: ZkOBS;
  let wETH: WETH9;
  let data = initTestData(testDataPath);
  let lastCommittedBlock: ZkOBS.StoredBlockStruct;
  let commitBlock: ZkOBS.CommitBlockStruct;

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
      zkUSDC: _zkUSDC,
      wETH: _wETH,
      zkOBS: _zkOBS,
    } = await loadFixture(deploy);
    operator = _operator;
    acc1 = _user1;
    acc2 = _user2;
    zkUSDC = _zkUSDC;
    zkOBS = _zkOBS;
    wETH = _wETH;
    // whitelist token
    await zkOBS.connect(operator).addToken(zkUSDC.address);
  });

  describe('Rollup for Acc1 register with USDC', function () {
    const testCaseId = 0;
    const amount = data[testCaseId + 1].inputs.reqData[testCaseId][3];
    const [pubKeyX, pubKeyY] = data[testCaseId + 1].inputs.tsPubKey[0];
    it('Mimic register', async function () {
      zkUSDC.connect(acc1).mint(amount);
      await zkUSDC.connect(acc1).approve(zkOBS.address, amount);
      await zkOBS
        .connect(acc1)
        .registerERC20(pubKeyX, pubKeyY, zkUSDC.address, amount);
    });
    it('Commit', async function () {
      const newBlocks: ZkOBS.CommitBlockStruct[] = [];
      // block for register
      let testData = data[testCaseId];
      commitBlock = {
        blockNumber: BigNumber.from(lastCommittedBlock.blockNumber).add(1),
        newStateRoot: testData.commitmentData.newStateRoot,
        newTsRoot: testData.commitmentData.newTsRoot,
        publicData: testData.commitmentData.o_chunk,
        publicDataOffsets: testData.commitmentData.pubdataOffset,
        timestamp: Date.now(),
      };
      newBlocks.push(commitBlock);
      //block for deposit
      testData = data[testCaseId + 1];
      commitBlock = {
        blockNumber: BigNumber.from(commitBlock.blockNumber).add(1),
        newStateRoot: testData.commitmentData.newStateRoot,
        newTsRoot: testData.commitmentData.newTsRoot,
        publicData: testData.commitmentData.o_chunk,
        publicDataOffsets: testData.commitmentData.pubdataOffset,
        timestamp: Date.now(),
      };
      newBlocks.push(commitBlock);
      console.log(newBlocks.length);
      console.log('gg');
      const oriCommittedBlockNum = await zkOBS.committedBlockNum();
      const oriCommittedL1RequestNum = await zkOBS.committedL1RequestNum();
      await zkOBS.commitBlocks(lastCommittedBlock, newBlocks);
      console.log('gg');
      const newCommittedBlockNum = await zkOBS.committedBlockNum();
      const newCommittedL1RequestNum = await zkOBS.committedL1RequestNum();
      expect(newCommittedBlockNum - oriCommittedBlockNum).to.be.eq(
        newBlocks.length,
      );
      expect(newCommittedL1RequestNum.sub(oriCommittedL1RequestNum)).to.be.eq(
        1,
      );
    });
    it('Prove', async function () {});
    it('Execute', async function () {});
  });
});
