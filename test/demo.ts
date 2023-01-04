import { poseidon } from '@big-whale-labs/poseidon';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { BigNumber, Contract, Signer } from 'ethers';
import { ethers } from 'hardhat';
import { WETH9 } from '../typechain-types';
import { ERC20FreeMint } from '../typechain-types';
import { Operations, ZkOBS } from '../typechain-types/contracts/ZkOBS';
import { deploy, genTsAddr } from './utils';
import {
  amountToTxAmountV3_40bit,
  getRollupData,
  stateToCommitment,
} from './helper/helper';
import inputs0 from './example/zkobs-10-8-4/0_register-acc1-eth-10-8-4-8-inputs.json';
import root0 from './example/zkobs-10-8-4/0_register-acc1-eth-10-8-4-8-commitment.json';
import calldata0 from './example/zkobs-10-8-4/0_register-acc1-eth-10-8-4-8-calldata-raw.json';
import inputs1 from './example/zkobs-10-8-4/1_register-acc2-usdt-10-8-4-8-inputs.json';
import root1 from './example/zkobs-10-8-4/1_register-acc2-usdt-10-8-4-8-commitment.json';
import calldata1 from './example/zkobs-10-8-4/1_register-acc2-usdt-10-8-4-8-calldata-raw.json';
import inputs2 from './example/zkobs-10-8-4/2_deposit-acc1-usdt-10-8-4-8-inputs.json';
import root2 from './example/zkobs-10-8-4/2_deposit-acc1-usdt-10-8-4-8-commitment.json';
import calldata2 from './example/zkobs-10-8-4/2_deposit-acc1-usdt-10-8-4-8-calldata-raw.json';
import inputs3 from './example/zkobs-10-8-4/3_deposit-acc2-eth-10-8-4-8-inputs.json';
import root3 from './example/zkobs-10-8-4/3_deposit-acc2-eth-10-8-4-8-commitment.json';
import calldata3 from './example/zkobs-10-8-4/3_deposit-acc2-eth-10-8-4-8-calldata-raw.json';
import inputs4 from './example/zkobs-10-8-4/4_withdraw-acc1-eth-10-8-4-8-inputs.json';
import root4 from './example/zkobs-10-8-4/4_withdraw-acc1-eth-10-8-4-8-commitment.json';
import calldata4 from './example/zkobs-10-8-4/4_withdraw-acc1-eth-10-8-4-8-calldata-raw.json';
import inputs5 from './example/zkobs-10-8-4/5_order-acc1-eth2usdt-10-8-4-8-inputs.json';
import root5 from './example/zkobs-10-8-4/5_order-acc1-eth2usdt-10-8-4-8-commitment.json';
import calldata5 from './example/zkobs-10-8-4/5_order-acc1-eth2usdt-10-8-4-8-calldata-raw.json';
import inputs6 from './example/zkobs-10-8-4/6_order-acc2-usdt2eth-10-8-4-8-inputs.json';
import root6 from './example/zkobs-10-8-4/6_order-acc2-usdt2eth-10-8-4-8-commitment.json';
import calldata6 from './example/zkobs-10-8-4/6_order-acc2-usdt2eth-10-8-4-8-calldata-raw.json';
import inputs7 from './example/zkobs-10-8-4/7_order-acc2-usdt2eth-10-8-4-8-inputs.json';
import root7 from './example/zkobs-10-8-4/7_order-acc2-usdt2eth-10-8-4-8-commitment.json';
import calldata7 from './example/zkobs-10-8-4/7_order-acc2-usdt2eth-10-8-4-8-calldata-raw.json';

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
  let lastCommittedBlock: ZkOBS.StoredBlockStruct;
  let commitBlock: ZkOBS.CommitBlockStruct;

  const CALLDATA_CHUNK = 50;
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

  describe('Rollup for single register with ETH', function () {
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
    } = getRollupData(inputs0, root0, calldata0);

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

      lastCommittedBlock = {
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

      commitBlock = {
        blockNumber: BigNumber.from('1'),
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
      ).to.be.eq(2);
    });

    it('Prove single register with ETH', async function () {
      // prove blocks
      const oriTotalProvedBlocks = await zkOBS.provedBlockNum();

      const committedBlocks: ZkOBS.StoredBlockStruct[] = [];
      const commitedBlock: ZkOBS.StoredBlockStruct = {
        blockNumber: commitBlock.blockNumber,
        stateRoot: commitBlock.newStateRoot,
        l1RequestNum: 2,
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

    it('Execute single register with ETH', async function () {
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

  describe('Rollup for single register with USDC', function () {
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
    } = getRollupData(inputs1, root1, calldata1);

    it('User register with USDC', async function () {
      // get user's states first
      const oriBalance: BigNumber = await zkUSDC.balanceOf(zkOBS.address);
      const oriAccountNum = await zkOBS.accountNum();
      const oriTotalPendingRequests = await zkOBS.pendingL1RequestNum();

      // call deposit
      zkUSDC.connect(user2).mint(amount);

      await zkUSDC.connect(user2).approve(zkOBS.address, amount);
      await zkOBS
        .connect(user2)
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
      const accountId = await zkOBS.accountIdOf(await user2.getAddress());
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

      const newBlocks: ZkOBS.CommitBlockStruct[] = [];
      const tokenIdUSDC = await zkOBS.tokenIdOf(zkUSDC.address);
      const accountId = await zkOBS.accountIdOf(await user2.getAddress());
      const l2Addr = genTsAddr(pubKeyX, pubKeyY);
      const publicData = ethers.utils
        .solidityPack(
          ['uint8', 'uint32', 'uint16', 'uint128', 'bytes20'],
          [OpType.REGISTER, accountId, tokenIdUSDC, amount, l2Addr],
        )
        .padEnd((CALLDATA_CHUNK * 12 * 8) / 4 + 2, '0');

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
      ).to.be.eq(2);
    });

    it('Prove single register with USDC', async function () {
      // prove blocks
      const oriTotalProvedBlocks = await zkOBS.provedBlockNum();

      const committedBlocks: ZkOBS.StoredBlockStruct[] = [];
      const commitedBlock: ZkOBS.StoredBlockStruct = {
        blockNumber: commitBlock.blockNumber,
        stateRoot: commitBlock.newStateRoot,
        l1RequestNum: 2,
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
    it('Execute single register with USDC', async function () {
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

  describe('Rollup for Acc1 single deposit with USDC', function () {
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
    } = getRollupData(inputs2, root2, calldata2);

    it('Acc1 deposit with USDC', async function () {
      // console.log(inputs2.reqData);
      const reqData = inputs2.reqData;
      for (let i = 0; i < inputs2.reqData.length; i++) {
        let amt = reqData[i][3];

        // get user's states first
        const oriBalance: BigNumber = await zkUSDC.balanceOf(zkOBS.address);
        const oriTotalPendingRequests = await zkOBS.pendingL1RequestNum();

        // call deposit
        zkUSDC.connect(user1).mint(amt);

        await zkUSDC.connect(user1).approve(zkOBS.address, amt);
        await zkOBS.connect(user1).depositERC20(zkUSDC.address, amt);
        // check user balance
        const newBalance: BigNumber = await zkUSDC.balanceOf(zkOBS.address);
        expect(newBalance.sub(oriBalance)).to.be.eq(amt);

        // check totalPendingRequest increased
        const newTotalPendingRequests = await zkOBS.pendingL1RequestNum();
        expect(newTotalPendingRequests.sub(oriTotalPendingRequests)).to.be.eq(
          1,
        );

        // check the request is existed in the L1 request queue
        const firstL1RequestId = await zkOBS.firstL1RequestId();
        const totalPendingL1Requests = await zkOBS.pendingL1RequestNum();
        const accountId = await zkOBS.accountIdOf(await user1.getAddress());
        const tokenId = await zkOBS.tokenIdOf(zkUSDC.address);

        const deposit: Operations.DepositStruct = {
          accountId: accountId,
          tokenId: tokenId,
          amount: amt,
        };
        let requestId = firstL1RequestId.add(totalPendingL1Requests).sub(1);
        const success = await zkOBS.checkDepositL1Request(deposit, requestId);
        expect(success).to.be.true;
      }
    });

    it('Commit Acc1 single deposit with USDC', async function () {
      zkOBS = zkOBS.connect(operator);

      const newBlocks: ZkOBS.CommitBlockStruct[] = [];
      const tokenIdUSDC = await zkOBS.tokenIdOf(zkUSDC.address);
      const accountId = await zkOBS.accountIdOf(await user1.getAddress());
      const l2Addr = genTsAddr(pubKeyX, pubKeyY);
      const publicData = ethers.utils
        .solidityPack(
          ['uint8', 'uint32', 'uint16', 'uint128'],
          [OpType.DEPOSIT, accountId, tokenIdUSDC, amount],
        )
        .padEnd((CALLDATA_CHUNK * 12 * 8) / 4 + 2, '0');

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
      ).to.be.eq(inputs2.reqData.length);
    });

    it('Prove Acc1 single deposit with USDC', async function () {
      // prove blocks
      const oriTotalProvedBlocks = await zkOBS.provedBlockNum();

      const committedBlocks: ZkOBS.StoredBlockStruct[] = [];
      const commitedBlock: ZkOBS.StoredBlockStruct = {
        blockNumber: commitBlock.blockNumber,
        stateRoot: commitBlock.newStateRoot,
        l1RequestNum: inputs2.reqData.length,
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

    it('Execute Acc1 single deposit with USDC', async function () {
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
});
