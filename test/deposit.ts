import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { Signer, BigNumber, ethers } from 'ethers';
import { deploy, genL2Addr } from '../lib/utils';
import { ERC20FreeMint, ZkOBS, WETH9 } from '../typechain-types';
import { Operations } from '../typechain-types/contracts/ZkOBS';
import { expect } from 'chai';

describe('Unit test of Deposit', function () {
  let operator: Signer;
  let user1: Signer;
  let user2: Signer;
  let zkUSDC: ERC20FreeMint;
  let zkOBS: ZkOBS;
  let wETH: WETH9;

  beforeEach(async function () {
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

    // register first
    const amount: BigNumber = ethers.utils.parseEther('0.05');
    const tokenAddr = '0x'.padEnd(42, '0');

    await zkOBS
      .connect(user1)
      .register(pubKeyX, pubKeyY, tokenAddr, amount, { value: amount });
  });

  const pubKeyX = BigNumber.from('3');
  const pubKeyY = BigNumber.from('4');

  it('Legal depositETH', async function () {
    // get user's states first
    const oriBalance: BigNumber = await wETH.balanceOf(zkOBS.address);
    const oriPendingL1RequestNum = await zkOBS.pendingL1RequestNum();

    // call deposit
    const amount: BigNumber = ethers.utils.parseEther('0.05');

    await zkOBS.connect(user1).depositETH({ value: amount });

    // check user balance
    const newBalance: BigNumber = await wETH.balanceOf(zkOBS.address);
    expect(newBalance.sub(oriBalance)).to.be.eq(amount);

    // check totalPendingRequest increased
    const newPendingL1RequestNum = await zkOBS.pendingL1RequestNum();
    expect(newPendingL1RequestNum.sub(oriPendingL1RequestNum)).to.be.eq(1);

    // check the request is existed in the L1 request queue
    const firstL1RequestId = await zkOBS.firstL1RequestId();
    const accountId = await zkOBS.accountIdOf(await user1.getAddress());
    const tokenId = await zkOBS.tokenIdOf(wETH.address);

    let requestId = firstL1RequestId.add(newPendingL1RequestNum).sub(1);

    const deposit: Operations.DepositStruct = {
      accountId: accountId,
      tokenId: tokenId,
      amount: amount,
    };
    const success = await zkOBS.isDepositInL1Request(deposit, requestId);
    expect(success).to.be.true;
  });

  it('Legal depositERC20', async function () {
    // get user's states first
    const oriBalance: BigNumber = await zkUSDC.balanceOf(zkOBS.address);
    const oriPendingL1RequestNum = await zkOBS.pendingL1RequestNum();

    // call deposit
    zkUSDC.connect(user1).mint(BigNumber.from('100000000'));
    const amount: BigNumber = BigNumber.from('1000000');
    await zkUSDC.connect(user1).approve(zkOBS.address, amount);
    await zkOBS.connect(user1).depositERC20(zkUSDC.address, amount);

    // check user balance
    const newBalance: BigNumber = await zkUSDC.balanceOf(zkOBS.address);
    expect(newBalance.sub(oriBalance)).to.be.eq(amount);

    // check totalPendingRequest increased
    const newPendingL1RequestNum = await zkOBS.pendingL1RequestNum();
    expect(newPendingL1RequestNum.sub(oriPendingL1RequestNum)).to.be.eq(1);

    // check the request is existed in the L1 request queue
    const firstL1RequestId = await zkOBS.firstL1RequestId();
    const accountId = await zkOBS.accountIdOf(await user1.getAddress());
    const tokenId = await zkOBS.tokenIdOf(zkUSDC.address);

    let requestId = firstL1RequestId.add(newPendingL1RequestNum).sub(1);

    const deposit: Operations.DepositStruct = {
      accountId: accountId,
      tokenId: tokenId,
      amount: amount,
    };

    let success = await zkOBS.isDepositInL1Request(deposit, requestId);
    expect(success).to.be.true;
  });

  it('Legal deposit with ETH', async function () {
    // get user's states first
    const oriBalance: BigNumber = await wETH.balanceOf(zkOBS.address);
    const oriPendingL1RequestNum = await zkOBS.pendingL1RequestNum();

    // call deposit
    const amount: BigNumber = ethers.utils.parseEther('0.05');
    const tokenAddr = '0x'.padEnd(42, '0');

    await zkOBS.connect(user1).deposit(tokenAddr, amount, { value: amount });

    // check user balance
    const newBalance: BigNumber = await wETH.balanceOf(zkOBS.address);
    expect(newBalance.sub(oriBalance)).to.be.eq(amount);

    // check totalPendingRequest increased
    const newPendingL1RequestNum = await zkOBS.pendingL1RequestNum();
    expect(newPendingL1RequestNum.sub(oriPendingL1RequestNum)).to.be.eq(1);

    // check the request is existed in the L1 request queue
    const firstL1RequestId = await zkOBS.firstL1RequestId();
    const accountId = await zkOBS.accountIdOf(await user1.getAddress());
    const tokenId = await zkOBS.tokenIdOf(wETH.address);

    let requestId = firstL1RequestId.add(newPendingL1RequestNum).sub(1);

    const deposit: Operations.DepositStruct = {
      accountId: accountId,
      tokenId: tokenId,
      amount: amount,
    };
    const success = await zkOBS.isDepositInL1Request(deposit, requestId);
    expect(success).to.be.true;
  });

  it('Legal deposit with ERC20', async function () {
    // get user's states first
    const oriBalance: BigNumber = await zkUSDC.balanceOf(zkOBS.address);
    const oriPendingL1RequestNum = await zkOBS.pendingL1RequestNum();

    // call deposit
    zkUSDC.connect(user1).mint(BigNumber.from('100000000'));
    const amount: BigNumber = BigNumber.from('1000000');
    await zkUSDC.connect(user1).approve(zkOBS.address, amount);
    await zkOBS.connect(user1).deposit(zkUSDC.address, amount);

    // check user balance
    const newBalance: BigNumber = await zkUSDC.balanceOf(zkOBS.address);
    expect(newBalance.sub(oriBalance)).to.be.eq(amount);

    // check totalPendingRequest increased
    const newPendingL1RequestNum = await zkOBS.pendingL1RequestNum();
    expect(newPendingL1RequestNum.sub(oriPendingL1RequestNum)).to.be.eq(1);

    // check the request is existed in the L1 request queue
    const firstL1RequestId = await zkOBS.firstL1RequestId();
    const accountId = await zkOBS.accountIdOf(await user1.getAddress());
    const tokenId = await zkOBS.tokenIdOf(zkUSDC.address);

    let requestId = firstL1RequestId.add(newPendingL1RequestNum).sub(1);

    const deposit: Operations.DepositStruct = {
      accountId: accountId,
      tokenId: tokenId,
      amount: amount,
    };

    let success = await zkOBS.isDepositInL1Request(deposit, requestId);
    expect(success).to.be.true;
  });
});
