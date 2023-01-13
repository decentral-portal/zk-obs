import { ethers } from 'hardhat';
import { WETH9 } from '../typechain-types';
import { ERC20FreeMint } from '../typechain-types/contracts/ERC20FreeMint';
import { ZkOBS } from '../typechain-types/contracts/ZkOBS';
import { BigNumber } from 'ethers';
import { poseidon } from '@big-whale-labs/poseidon';
import initStates from './example/zkobs-10-8-4/initStates.json';
const circomlibjs = require('circomlibjs');
const { createCode, generateABI } = circomlibjs.poseidonContract;

export async function deploy() {
  const [operator, user1, user2] = await ethers.getSigners();

  const ERC20FreeMint = await ethers.getContractFactory('ERC20FreeMint');

  let decimals = BigNumber.from('6');
  const USDT: ERC20FreeMint = await ERC20FreeMint.connect(operator).deploy(
    'Tether USD',
    'USDT',
    decimals,
  );
  await USDT.deployed();
  console.log('Deployed USDT:', USDT.address);

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

  const WBTC = await ethers.getContractFactory('WBTC');
  WETH.connect(operator);
  const wBTC: WBTC = await WBTC.deploy();
  await wBTC.deployed();
  console.log('Deployed wBTC:', wBTC.address);

  decimals = BigNumber.from('6');
  const USDC: ERC20FreeMint = await ERC20FreeMint.connect(operator).deploy(
    'USD Coin',
    'USDC',
    decimals,
  );
  await USDC.deployed();
  console.log('Deployed USDC:', USDC.address);

  decimals = BigNumber.from('18');
  const DAI: ERC20FreeMint = await ERC20FreeMint.connect(operator).deploy(
    'DAI Stablecoin',
    'DAI',
    decimals,
  );
  await DAI.deployed();
  console.log('Deployed DAI:', DAI.address);

  return { operator, user1, user2, wETH, wBTC, USDT, USDC, DAI, zkOBS };
}

export function genTsAddr(x: BigNumber, y: BigNumber) {
  const hashedTsPubKey = poseidon([x, y]);
  return '0x' + hashedTsPubKey.toString(16).slice(-40);
}
