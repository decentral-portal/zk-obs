import { ethers } from 'hardhat';
import { WETH9, WBTC, ERC20FreeMint } from '../typechain-types';
import type { ZkOBS } from '../typechain-types/contracts/ZkOBS';
import { BigNumber, BytesLike } from 'ethers';
import { poseidon } from '@big-whale-labs/poseidon';
import fs from 'fs';
import { resolve } from 'path';

const initStates = JSON.parse(
  fs.readFileSync('./test/demo/initStates.json', 'utf-8'),
);
const circomlibjs = require('circomlibjs');
const { createCode, generateABI } = circomlibjs.poseidonContract;

export async function deploy(genesisStateRoot: string) {
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

export function initTestData(baseDir: string) {
  const result = [];
  const files = fs.readdirSync(baseDir, {
    withFileTypes: true,
  });
  for (let index = 0; index < files.length; index++) {
    const file = files[index];
    if (file.isFile() && file.name.endsWith('-commitment.json')) {
      const index = file.name.split('_')[0];
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
        index: index,
        path: resolve(baseDir, file.name),
        commitmentData,
        callData,
        inputs,
      });
    }
  }
  return result.sort((a, b) => parseInt(a.index) - parseInt(b.index));
}

export function getPubDataOffset(isCriticalChunk: BytesLike) {
  let pubdataOffset = [];
  for (let i = 0; i < isCriticalChunk.length; i++) {
    if (isCriticalChunk[i] == '1') {
      pubdataOffset.push((Math.floor(i / 2) - 1) * 12);
    }
  }
  return pubdataOffset;
}

export function stateToCommitment({
  oriStateRoot,
  newStateRoot,
  newTsRoot,
  pubdata,
}: {
  oriStateRoot: string;
  newStateRoot: string;
  newTsRoot: string;
  pubdata: string;
}) {
  const commitmentMsg = ethers.utils.solidityPack(
    ['bytes32', 'bytes32', 'bytes32', 'bytes'],
    [oriStateRoot, newStateRoot, newTsRoot, pubdata],
  );
  const commitmentHash = ethers.utils.sha256(commitmentMsg);

  const commitment = toHex(
    BigInt(
      '0b' + BigInt(commitmentHash).toString(2).padStart(256, '0').slice(3),
    ),
  );

  return commitmentHash;
}

export function toHex(n: string | BigInt, pad = 64) {
  const num = typeof n === 'bigint' ? n : BigInt(n as string);
  const rawHex = num.toString(16).padStart(pad, '0');
  return '0x' + rawHex;
}
