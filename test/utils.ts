import { ethers } from 'hardhat';
import { WETH9 } from '../typechain-types';
import { ERC20FreeMint } from '../typechain-types/contracts/ERC20FreeMint';
import { ZkOBS } from '../typechain-types/contracts/ZkOBS';
import { BigNumber } from 'ethers';
import { poseidon } from '@big-whale-labs/poseidon';
import initStates from './example/zkobs-p1/initStates.json';
const circomlibjs = require('circomlibjs');
const { createCode, generateABI } = circomlibjs.poseidonContract;

export async function deploy() {
  const [operator, user1, user2] = await ethers.getSigners();

  const ERC20FreeMint = await ethers.getContractFactory('ERC20FreeMint');
  const decimals = BigNumber.from('6');
  const zkUSDC: ERC20FreeMint = await ERC20FreeMint.connect(operator).deploy(
    'ZK USDC',
    'ZkUSDC',
    decimals,
  );
  await zkUSDC.deployed();
  console.log('Deployed zkUSDC:', zkUSDC.address);

  const WETH = await ethers.getContractFactory('WETH9');
  WETH.connect(operator);
  const wETH: WETH9 = await WETH.deploy();
  await wETH.deployed();
  console.log('Deployed wETH:', wETH.address);

  const verifierFactory = await ethers.getContractFactory('Verifier');
  verifierFactory.connect(operator);
  const verifier = await verifierFactory.deploy();
  console.log('Deployed verifier:', verifier.address);

  // Deploy Poseidon contract
  const Poseidon2Factory = new ethers.ContractFactory(
    generateABI(2),
    createCode(2),
    operator,
  );
  const poseidom2Contract = await Poseidon2Factory.deploy();
  await poseidom2Contract.deployed();
  console.log('Deployed poseidom:', poseidom2Contract.address);

  const genesisStateRoot = initStates.stateRoot;
  const ZkOBS = await ethers.getContractFactory('ZkOBS');

  const zkOBS: ZkOBS = await ZkOBS.connect(operator).deploy(
    wETH.address,
    verifier.address,
    genesisStateRoot,
    poseidom2Contract.address,
  );
  await zkOBS.deployed();
  console.log('Deployed zkOBS:', zkOBS.address);

  return { operator, user1, user2, zkUSDC, wETH, zkOBS };
}

export function genTsAddr(x: BigNumber, y: BigNumber) {
  const hashedTsPubKey = poseidon([x, y]);
  return '0x' + hashedTsPubKey.toString(16).slice(-40);
}
