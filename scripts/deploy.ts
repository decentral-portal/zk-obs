import { ethers, upgrades } from 'hardhat';
import { ERC20FreeMint, ZkOBS } from '../typechain-types';
const circomlibjs = require('circomlibjs');
const { createCode, generateABI } = circomlibjs.poseidonContract;

async function main() {
  let initialData: any;
  const [operator] = await ethers.getSigners();

  console.log(
    'Deploying contracts with the account:',
    await operator.getAddress(),
  );

  console.log('Account balance:', (await operator.getBalance()).toString());

  // Deploy Poseidon contract
  const Poseidon2Factory = new ethers.ContractFactory(
    generateABI(2),
    createCode(2),
    operator,
  );
  const poseidom2Contract = await Poseidon2Factory.deploy();
  console.log({
    poseidom2Contract: poseidom2Contract.address,
  });

  const WETH = await ethers.getContractFactory('WETH9');
  WETH.connect(operator);
  const wETH = await WETH.deploy();
  await wETH.deployed();

  console.log('WETH address:', wETH.address);

  const ERC20FreeMint = await ethers.getContractFactory('ERC20FreeMint');
  const usdcDecimals = '6';
  const tsUSDC: ERC20FreeMint = await ERC20FreeMint.deploy(
    'Zk-USDC',
    'ZkUSDC',
    usdcDecimals,
  );
  await tsUSDC.deployed();
  console.log('zkUSDC address:', tsUSDC.address);

  const genesisStateRoot =
    '0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470';
  const ZkOBSFactory = await ethers.getContractFactory('ZkOBS');

  const zkOBS: ZkOBS = await ZkOBSFactory.connect(operator).deploy(
    wETH.address,
    '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    genesisStateRoot,
    poseidom2Contract.address,
  );
  await zkOBS.deployed();
  console.log('ZkOBS address:', zkOBS.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
