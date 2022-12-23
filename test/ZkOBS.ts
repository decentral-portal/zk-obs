import { poseidon } from '@big-whale-labs/poseidon';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { BigNumber, Contract, Signer } from 'ethers';
import { ethers } from 'hardhat';
import { ERC20FreeMintInterface } from '../typechain-types/contracts/ERC20FreeMint';
import { ERC20FreeMint } from '../typechain-types/contracts/ERC20FreeMint';
import { Operations, ZkOBS } from '../typechain-types/contracts/ZkOBS';
import { expect } from 'chai';

export async function deploy() {
  let initialData: any;

  const [operator, user] = await ethers.getSigners();

  const ERC20FreeMint = await ethers.getContractFactory('ERC20FreeMint');
  const decimals = BigNumber.from('6');
  const zkUSDC: ERC20FreeMint = await ERC20FreeMint.connect(operator).deploy('ZK USDC', 'ZkUSDC', decimals);
  await zkUSDC.deployed();

  const genesisStateRoot =
    '0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470';
  const ZkOBS = await ethers.getContractFactory('ZkOBS');

  const zkOBS: ZkOBS = await ZkOBS.connect(operator).deploy();
  await zkOBS.deployed();
//   const verifierFactory = await ethers.getContractFactory('Verifier');
//   verifierFactory.connect(operator);
//   const verifier = await verifierFactory.deploy();

//   zkTrueUp.connect(operator).setVerifier(verifier.address);

  return { operator, user, zkUSDC, zkOBS };
}

export function genTsAddr(x:BigNumber, y:BigNumber) {
  const hashedTsPubKey = poseidon([x, y]);
  return '0x' + hashedTsPubKey.toString(16).slice(-40);
}

describe('Unit test of zkOBS', function () {
    let operator: Signer;
    let user: Signer;
    let zkUSDC: ERC20FreeMint;
    let zkOBS: ZkOBS;
  
    describe('Normal Function', function () {
      before(async function () {
        const {
          operator: _operator,
          user: _user,
          zkUSDC: _zkUSDC,
          zkOBS: _zkOBS,
        } = await loadFixture(deploy);
        operator = _operator;
        user = _user;
        zkUSDC = _zkUSDC;
        zkOBS = _zkOBS;
        // whitelist token
        await zkOBS.connect(operator).addToken(zkUSDC.address);
      });
  
      it('Legal register', async function () {
        // get user's states first
        const oriBalance:BigNumber = await zkUSDC.balanceOf(zkOBS.address);
        const oriAccountNum = await zkOBS.accountNum();
        const oriTotalPendingRequests =
          await zkOBS.pendingL1RequestNum();
  
        // call deposit
        zkUSDC.connect(user).mint(BigNumber.from('100000000'));
        const l2Addr = genTsAddr(BigNumber.from('3'),BigNumber.from('4'));
        const amount: BigNumber = BigNumber.from('1000000');
        await zkUSDC.connect(user).approve(zkOBS.address, amount);
        await zkOBS
          .connect(user)
          .deposit(l2Addr, zkUSDC.address, amount);
  
        // check user balance
        const newBalance:BigNumber = await zkUSDC.balanceOf(zkOBS.address);
        expect(newBalance.sub(oriBalance)).to.be.eq(amount);
  
        // check accountNum increased
        const newAccountNum = await zkOBS.accountNum();
        expect(newAccountNum - oriAccountNum).to.be.eq(1);
  
        // check totalPendingRequest increased
        const newTotalPendingRequests =
          await zkOBS.pendingL1RequestNum();
        expect(newTotalPendingRequests.sub(oriTotalPendingRequests)).to.be.eq(2);
  
        // check the request is existed in the L1 request queue
        const firstL1RequestId = await zkOBS.firstL1RequestId();
        const totalPendingL1Requests = await zkOBS.pendingL1RequestNum();
        const accountId = await zkOBS.accountIdOf(await user.getAddress());
        const tokenId = await zkOBS.tokenIdOf(zkUSDC.address);
        const register = {
          accountId: accountId,
          l2Addr: l2Addr,
        };
  
        let requestId = firstL1RequestId.add(totalPendingL1Requests).sub(2);
        let success = await zkOBS.checkRegisterL1Request(register, requestId);
        expect(success).to.be.true;
  
        const deposit = {
          accountId: accountId,
          tokenId: tokenId,
          amount: amount,
        };
        requestId = firstL1RequestId.add(totalPendingL1Requests).sub(1);
        success = await zkOBS.checkDepositL1Request(deposit, requestId);
        expect(success).to.be.true;
      });

      it('Legal deposit', async function () {
        // get user's states first
        const oriBalance:BigNumber = await zkUSDC.balanceOf(zkOBS.address);
        const oriTotalPendingRequests =
          await zkOBS.pendingL1RequestNum();
  
        // call deposit
        zkUSDC.connect(user).mint(BigNumber.from('200000000'));
        const l2Addr = genTsAddr(BigNumber.from('3'),BigNumber.from('4'));
        const amount: BigNumber = BigNumber.from('1000000');
        await zkUSDC.connect(user).approve(zkOBS.address, amount);
        await zkOBS
          .connect(user)
          .deposit(l2Addr, zkUSDC.address, amount);
  
        // check user balance
        const newBalance:BigNumber = await zkUSDC.balanceOf(zkOBS.address);
        expect(newBalance.sub(oriBalance)).to.be.eq(amount);
  
        // check totalPendingRequest increased
        const newTotalPendingRequests =
          await zkOBS.pendingL1RequestNum();
        expect(newTotalPendingRequests.sub(oriTotalPendingRequests)).to.be.eq(1);
  
        // check the request is existed in the L1 request queue
        const firstL1RequestId = await zkOBS.firstL1RequestId();
        const totalPendingL1Requests = await zkOBS.pendingL1RequestNum();
        const accountId = await zkOBS.accountIdOf(await user.getAddress());
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
