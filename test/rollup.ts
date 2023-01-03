import { poseidon } from '@big-whale-labs/poseidon';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { BigNumber, Contract, Signer } from 'ethers';
import { ethers } from 'hardhat';
import { WETH9 } from '../typechain-types';
import { ERC20FreeMint } from '../typechain-types';
import { Operations, ZkOBS } from '../typechain-types/contracts/ZkOBS';
import { deploy, genTsAddr } from './utils';
import inputs0 from './example/zkobs-p1/0_register-acc1-p5-8-8-4-8-inputs.json';
import root0 from './example/zkobs-p1/0_register-acc1-p5-commitment.json';
import calldata0 from './example/zkobs-p1/0_register-acc1-p5-8-8-4-8-calldata-raw.json';
import { stateToCommitment, getRollupData } from './helper/helper';

describe('Unit test of rollup', function () {
  enum OpType {
    UNKNOWN,
    REGISTER,
    DEPOSIT,
    WITHDRAW,
    SECONDLIMITORDER,
    SECONDLIMITSTART,
    SECONDLIMITEXCHANGE,
    SECONDLIMITEND,
    SECONDMARKETORDER,
    SECONDMARKETEXCHANGE,
    SECONDMARKETEND,
    CANCELORDER,
  }

  let operator: Signer;
  let user1: Signer;
  let user2: Signer;
  let zkUSDC: ERC20FreeMint;
  let zkOBS: ZkOBS;
  let wETH: WETH9;

  const CALLDATA_CHUNK = 9;
  const emptyHash =
    '0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470';

  describe('Rollup for single register with ETH', function () {
    const {
      pubKeyX,
      pubKeyY,
      amount,
      oriStateRoot,
      newStateRoot,
      newTsRoot,
      commitmentHashOrigin,
      proof_a,
      proof_b,
      proof_c,
      proof_commitment,
    } = getRollupData(inputs0, root0, calldata0);

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

    it('User register with ETH', async function () {
      // get user's states first
      const oriBalance: BigNumber = await wETH.balanceOf(zkOBS.address);
      const oriAccountNum = await zkOBS.accountNum();
      const oriTotalPendingRequests = await zkOBS.pendingL1RequestNum();

      // call deposit
      await zkOBS
        .connect(user1)
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
      const accountId = await zkOBS.accountIdOf(await user1.getAddress());
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

    it('Commit single register with ETH', async function () {
      zkOBS = zkOBS.connect(operator);

      const lastCommittedBlock: ZkOBS.StoredBlockStruct = {
        blockNumber: BigNumber.from('0'),
        stateRoot: oriStateRoot,
        l1RequestNum: BigNumber.from('0'),
        pendingRollupTxHash: emptyHash,
        commitment: ethers.utils.defaultAbiCoder.encode(
          ['bytes32'],
          [String('0x').padEnd(66, '0')],
        ),
        timestamp: BigNumber.from('0'),
      };

      const newBlocks: ZkOBS.CommitBlockStruct[] = [];
      const tokenIdWETH = await zkOBS.tokenIdOf(wETH.address);
      const accountId = await zkOBS.accountIdOf(await user1.getAddress());
      const l2Addr = genTsAddr(pubKeyX, pubKeyY);
      const publicData = ethers.utils
        .solidityPack(
          ['uint8', 'uint32', 'uint16', 'uint128', 'bytes20'],
          [OpType.REGISTER, accountId, tokenIdWETH, amount, l2Addr],
        )
        .padEnd((CALLDATA_CHUNK * 12 * 8) / 4 + 2, '0');
      console.log({ publicData });
      const commitBlock: ZkOBS.CommitBlockStruct = {
        blockNumber: BigNumber.from('1'),
        newStateRoot: newStateRoot,
        newTsRoot: newTsRoot,
        publicData: publicData,
        publicDataOffsets: [BigNumber.from('0')],
        timestamp: BigNumber.from('1'),
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
      ).to.be.eq(2);
    });

    it('Prove single register with ETH', async function () {
      // prove blocks
      const oriTotalProvedBlocks = await zkOBS.provedBlockNum();

      const committedBlocks: ZkOBS.StoredBlockStruct[] = [];
      const commitedBlock: ZkOBS.StoredBlockStruct = {
        blockNumber: 1,
        stateRoot: newStateRoot,
        l1RequestNum: 2,
        pendingRollupTxHash: emptyHash,
        commitment: commitmentHashOrigin,
        timestamp: 1,
      };
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
    it('Execute single register with ETH', async function () {
      // // execute blocks
      // const oriTotalExecutedBlocks = await zkTrueUp.getTotalExecutedBlocks();
      // const oriFirstL1RequestId = await zkTrueUp.getFirstL1RequestId();
      // const oriTotalCommittedL1Requests =
      //   await zkTrueUp.getTotalCommittedL1Requests();
      // const oriTotalPendingL1Requests =
      //   await zkTrueUp.getTotalPendingL1Requests();
      // let provedBlocks: ExecuteBlock[];
      // await zkTrueUp.executeBlocks(provedBlocks);
      // const newTotalExecutedBlocks = await zkTrueUp.getTotalExecutedBlocks();
      // const newFirstL1RequestId = await zkTrueUp.getFirstL1RequestId();
      // const newTotalCommittedL1Requests =
      //   await zkTrueUp.getTotalCommittedL1Requests();
      // const newTotalPendingL1Requests =
      //   await zkTrueUp.getTotalPendingL1Requests();
      // console.log(6);
      // expect(newTotalExecutedBlocks - oriTotalExecutedBlocks).to.be.eq(
      //   provedBlocks.length,
      // );
      // let totalL1Requests = 0;
      // for (let i = 0; i < provedBlocks.length; i++) {
      //   totalL1Requests += provedBlocks[i].storedBlock.l1Requests;
      // }
      // expect(newFirstL1RequestId - oriFirstL1RequestId).to.be.eq(
      //   totalL1Requests,
      // );
      // expect(
      //   newTotalCommittedL1Requests - oriTotalCommittedL1Requests,
      // ).to.be.eq(totalL1Requests);
      // expect(oriTotalPendingL1Requests - newTotalPendingL1Requests).to.be.eq(
      //   totalL1Requests,
      // );
    });
  });

  describe('Rollup for single register with USDC', function () {
    const { pubKeyX, pubKeyY, amount } = getRollupData(
      inputs0,
      root0,
      calldata0,
    );
    const CALLDATA_CHUNK = 9;
    const emptyHash =
      '0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470';
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

    it('User register with USDC', async function () {
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

    it('Commit single register with USDC', async function () {
      zkOBS = zkOBS.connect(operator);

      const lastCommittedBlock: ZkOBS.StoredBlockStruct = {
        blockNumber: BigNumber.from('0'),
        stateRoot: root.oriStateRoot,
        l1RequestNum: BigNumber.from('0'),
        pendingRollupTxHash: emptyHash,
        commitment: ethers.utils.defaultAbiCoder.encode(
          ['bytes32'],
          [String('0x').padEnd(66, '0')],
        ),
        timestamp: BigNumber.from('0'),
      };

      const newBlocks: ZkOBS.CommitBlockStruct[] = [];
      const tokenIdUSDC = await zkOBS.tokenIdOf(zkUSDC.address);
      const newStateRoot = root.newStateRoot;
      const newTsRoot = root.newTsRoot;
      const accountId = await zkOBS.accountIdOf(await user1.getAddress());
      const l2Addr = genTsAddr(pubKeyX, pubKeyY);
      const publicData = ethers.utils
        .solidityPack(
          ['uint8', 'uint32', 'uint16', 'uint128', 'bytes20'],
          [OpType.REGISTER, accountId, tokenIdUSDC, amount, l2Addr],
        )
        .padEnd((CALLDATA_CHUNK * 12 * 8) / 4 + 2, '0');
      console.log({ publicData });
      const commitBlock: ZkOBS.CommitBlockStruct = {
        blockNumber: BigNumber.from('1'),
        newStateRoot: newStateRoot,
        newTsRoot: newTsRoot,
        publicData: publicData,
        publicDataOffsets: [BigNumber.from('0')],
        timestamp: BigNumber.from('1'),
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
      ).to.be.eq(2);
    });

    it('Prove single register with USDC', async function () {
      // prove blocks
      const oriTotalProvedBlocks = await zkOBS.provedBlockNum();

      const committedBlocks: ZkOBS.StoredBlockStruct[] = [];
      const newStateRoot = root.newStateRoot;
      const { commitment, commitmentMessage, commitmentHashOrigin } =
        stateToCommitment(root);

      console.log({
        commitment,
        commitmentMessage,
        commitmentHashOrigin,
      });
      const commitedBlock: ZkOBS.StoredBlockStruct = {
        blockNumber: 1,
        stateRoot: newStateRoot,
        l1RequestNum: 2,
        pendingRollupTxHash: emptyHash,
        commitment: commitmentHashOrigin,
        timestamp: 1,
      };
      committedBlocks.push(commitedBlock);
      const proofs: ZkOBS.ProofStruct[] = [];
      const proof: ZkOBS.ProofStruct = {
        a: [BigNumber.from(calldata[0][0]), BigNumber.from(calldata[0][1])],
        b: [
          [
            BigNumber.from(calldata[1][0][0]),
            BigNumber.from(calldata[1][0][1]),
          ],
          [
            BigNumber.from(calldata[1][1][0]),
            BigNumber.from(calldata[1][1][1]),
          ],
        ],
        c: [BigNumber.from(calldata[2][0]), BigNumber.from(calldata[2][1])],
        commitment: [BigNumber.from(calldata[3][0])],
      };
      proofs.push(proof);

      await zkOBS.proveBlocks(committedBlocks, proofs);

      const newTotalProvedBlocks = await zkOBS.provedBlockNum();
      expect(newTotalProvedBlocks - oriTotalProvedBlocks).to.be.eq(
        committedBlocks.length,
      );
    });
    it('Execute single register with USDC', async function () {
      // // execute blocks
      // const oriTotalExecutedBlocks = await zkTrueUp.getTotalExecutedBlocks();
      // const oriFirstL1RequestId = await zkTrueUp.getFirstL1RequestId();
      // const oriTotalCommittedL1Requests =
      //   await zkTrueUp.getTotalCommittedL1Requests();
      // const oriTotalPendingL1Requests =
      //   await zkTrueUp.getTotalPendingL1Requests();
      // let provedBlocks: ExecuteBlock[];
      // await zkTrueUp.executeBlocks(provedBlocks);
      // const newTotalExecutedBlocks = await zkTrueUp.getTotalExecutedBlocks();
      // const newFirstL1RequestId = await zkTrueUp.getFirstL1RequestId();
      // const newTotalCommittedL1Requests =
      //   await zkTrueUp.getTotalCommittedL1Requests();
      // const newTotalPendingL1Requests =
      //   await zkTrueUp.getTotalPendingL1Requests();
      // console.log(6);
      // expect(newTotalExecutedBlocks - oriTotalExecutedBlocks).to.be.eq(
      //   provedBlocks.length,
      // );
      // let totalL1Requests = 0;
      // for (let i = 0; i < provedBlocks.length; i++) {
      //   totalL1Requests += provedBlocks[i].storedBlock.l1Requests;
      // }
      // expect(newFirstL1RequestId - oriFirstL1RequestId).to.be.eq(
      //   totalL1Requests,
      // );
      // expect(
      //   newTotalCommittedL1Requests - oriTotalCommittedL1Requests,
      // ).to.be.eq(totalL1Requests);
      // expect(oriTotalPendingL1Requests - newTotalPendingL1Requests).to.be.eq(
      //   totalL1Requests,
      // );
    });
  });
});
