import { ethers } from 'hardhat';
import { WETH9 } from '../typechain-types';
import { ERC20FreeMint } from '../typechain-types/contracts/ERC20FreeMint';
import { ZkOBS } from '../typechain-types/contracts/ZkOBS';
import { BigNumber } from 'ethers';
import { poseidon } from '@big-whale-labs/poseidon';
import fs from 'fs';
import { resolve } from 'path';

const initStates = JSON.parse(
  fs.readFileSync('./test/demo/initStates.json', 'utf-8'),
);
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

export function initTestData(baseDir: string) {
  const result = [];
  const files = fs.readdirSync(baseDir, {
    withFileTypes: true,
  });
  for (let index = 0; index < files.length; index++) {
    const file = files[index];
    if (file.isFile() && file.name.endsWith('-commitment.json')) {
      const name = file.name.replace('-commitment.json', '');
      const commitmentPath = resolve(baseDir, file.name);
      const calldataPath = resolve(baseDir, `${name}-calldata-raw.json`);
      const inputPath = resolve(baseDir, `${name}-inputs.json`);
      const commitmentData = JSON.parse(
        fs.readFileSync(commitmentPath, 'utf-8'),
      );
      const callData = JSON.parse(fs.readFileSync(calldataPath, 'utf-8'));
      const inputs = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));
      result.push({
        path: resolve(baseDir, file.name),
        commitmentData,
        callData,
        inputs,
      });
    }
  }
  return result;
}
