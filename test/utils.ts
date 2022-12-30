import { ethers } from 'hardhat';
import { WETH9 } from '../typechain-types';
import { ERC20FreeMint } from '../typechain-types/contracts/ERC20FreeMint';
import { ZkOBS } from '../typechain-types/contracts/ZkOBS';
import { BigNumber } from 'ethers';
import { poseidon } from '@big-whale-labs/poseidon';
import initStates from './example/zkobs-p1/initStates.json';

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

  const WETH = await ethers.getContractFactory('WETH9');
  WETH.connect(operator);
  const wETH: WETH9 = await WETH.deploy();
  await wETH.deployed();

  const verifierFactory = await ethers.getContractFactory('Verifier');
  verifierFactory.connect(operator);
  const verifier = await verifierFactory.deploy();

  const genesisStateRoot = initStates.stateRoot;
  const ZkOBS = await ethers.getContractFactory('ZkOBS');

  const zkOBS: ZkOBS = await ZkOBS.connect(operator).deploy(
    wETH.address,
    verifier.address,
    genesisStateRoot,
  );
  await zkOBS.deployed();

  return { operator, user1, user2, zkUSDC, wETH, zkOBS };
}

export function genTsAddr(x: BigNumber, y: BigNumber) {
  const hashedTsPubKey = poseidon([x, y]);
  return '0x' + hashedTsPubKey.toString(16).slice(-40);
}
