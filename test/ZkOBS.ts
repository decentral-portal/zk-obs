import { poseidon } from '@big-whale-labs/poseidon';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { BigNumber, Contract, Signer } from 'ethers';
import { ethers } from 'hardhat';
import { ERC20FreeMint } from '../typechain-types/contracts/ERC20FreeMint';
import { Operations, ZkOBS } from '../typechain-types/contracts/ZkOBS';
import { expect } from 'chai';
import { WETH9 } from '../typechain-types';
import { deploy, genL2Addr } from '../lib/utils';

describe('Unit test of zkOBS', function () {
  let operator: Signer;
  let user1: Signer;
  let user2: Signer;
  let zkUSDC: ERC20FreeMint;
  let zkOBS: ZkOBS;
  let wETH: WETH9;

  describe('Normal Function', function () {
    before(async function () {
      const {
        operator: _operator,
        user1: _user1,
        user2: _user2,
        zkUSDC: _zkUSDC,
        zkOBS: _zkOBS,
        wETH: _wETH,
      } = await loadFixture(deploy);
      operator = _operator;
      user1 = _user1;
      user2 = _user2;
      zkUSDC = _zkUSDC;
      zkOBS = _zkOBS;
      wETH = _wETH;
      // whitelist token
      await zkOBS.connect(operator).whitelistToken(zkUSDC.address);
    });

    const pubKeyX = BigNumber.from('3');
    const pubKeyY = BigNumber.from('4');

    it('Legal registerETH', async function () {
      // get user's states first
      const oriBalance: BigNumber = await wETH.balanceOf(zkOBS.address);
      const oriAccountNum = await zkOBS.accountNum();
      const oriTotalPendingRequests = await zkOBS.pendingL1RequestNum();

      // call deposit
      const amount: BigNumber = ethers.utils.parseEther('0.05');

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
      const l2Addr = genL2Addr(pubKeyX, pubKeyY);
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

    it('Legal depositETH', async function () {
      // get user's states first
      const oriBalance: BigNumber = await wETH.balanceOf(zkOBS.address);
      const oriTotalPendingRequests = await zkOBS.pendingL1RequestNum();

      // call deposit
      const amount: BigNumber = ethers.utils.parseEther('0.06');
      await zkOBS.connect(user1).depositETH({ value: amount });

      // check user balance
      const newBalance: BigNumber = await wETH.balanceOf(zkOBS.address);
      expect(newBalance.sub(oriBalance)).to.be.eq(amount);

      // check totalPendingRequest increased
      const newTotalPendingRequests = await zkOBS.pendingL1RequestNum();
      expect(newTotalPendingRequests.sub(oriTotalPendingRequests)).to.be.eq(1);

      // check the request is existed in the L1 request queue
      const firstL1RequestId = await zkOBS.firstL1RequestId();
      const totalPendingL1Requests = await zkOBS.pendingL1RequestNum();
      const accountId = await zkOBS.accountIdOf(await user1.getAddress());
      const tokenId = await zkOBS.tokenIdOf(wETH.address);
      const deposit: Operations.DepositStruct = {
        accountId: accountId,
        tokenId: tokenId,
        amount: amount,
      };
      let requestId = firstL1RequestId.add(totalPendingL1Requests).sub(1);
      let success = await zkOBS.checkDepositL1Request(deposit, requestId);
      expect(success).to.be.true;
    });

    it('Legal registerERC20', async function () {
      // get user's states first
      const oriBalance: BigNumber = await zkUSDC.balanceOf(zkOBS.address);
      const oriAccountNum = await zkOBS.accountNum();
      const oriTotalPendingRequests = await zkOBS.pendingL1RequestNum();

      // call deposit
      zkUSDC.connect(user2).mint(BigNumber.from('100000000'));
      const amount: BigNumber = BigNumber.from('1000000');
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

    it('Legal depositERC20', async function () {
      // get user's states first
      const oriBalance: BigNumber = await zkUSDC.balanceOf(zkOBS.address);
      const oriTotalPendingRequests = await zkOBS.pendingL1RequestNum();

      // call deposit
      zkUSDC.connect(user2).mint(BigNumber.from('200000000'));
      const amount: BigNumber = BigNumber.from('1000000');
      await zkUSDC.connect(user2).approve(zkOBS.address, amount);
      await zkOBS.connect(user2).depositERC20(zkUSDC.address, amount);

      // check user balance
      const newBalance: BigNumber = await zkUSDC.balanceOf(zkOBS.address);
      expect(newBalance.sub(oriBalance)).to.be.eq(amount);

      // check totalPendingRequest increased
      const newTotalPendingRequests = await zkOBS.pendingL1RequestNum();
      expect(newTotalPendingRequests.sub(oriTotalPendingRequests)).to.be.eq(1);

      // check the request is existed in the L1 request queue
      const firstL1RequestId = await zkOBS.firstL1RequestId();
      const totalPendingL1Requests = await zkOBS.pendingL1RequestNum();
      const accountId = await zkOBS.accountIdOf(await user2.getAddress());
      const tokenId = await zkOBS.tokenIdOf(zkUSDC.address);
      const deposit: Operations.DepositStruct = {
        accountId: accountId,
        tokenId: tokenId,
        amount: amount,
      };

      let requestId = firstL1RequestId.add(totalPendingL1Requests).sub(1);
      let success = await zkOBS.checkDepositL1Request(deposit, requestId);
      expect(success).to.be.true;
    });
  });
});
