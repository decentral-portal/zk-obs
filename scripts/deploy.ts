import { ethers, upgrades } from 'hardhat';
import { ERC20FreeMint, ZkOBS } from '../typechain-types';

async function main() {
  let initialData: any;
  const [operator] = await ethers.getSigners();

  console.log(
    'Deploying contracts with the account:',
    await operator.getAddress(),
  );

  console.log('Account balance:', (await operator.getBalance()).toString());

  const WETH = await ethers.getContractFactory('WETH9');
  WETH.connect(operator);
  const wETH = await WETH.deploy();
  await wETH.deployed();

  console.log('WETH address:', wETH.address);
  
  const ERC20FreeMint = await ethers.getContractFactory('ERC20FreeMint');
  const usdcDecimals = '6';
  const tsUSDC: ERC20FreeMint = await ERC20FreeMint.deploy('Zk-USDC', 'ZkUSDC', usdcDecimals);
  await tsUSDC.deployed();
  console.log('zkUSDC address:', tsUSDC.address);

  const genesisStateRoot =
    '0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470';
  const ZkOBSFactory = await ethers.getContractFactory('ZkOBS');

  const zkOBS: ZkOBS = await ZkOBSFactory.connect(operator).deploy(wETH.address, genesisStateRoot);
  await zkOBS.deployed();
  console.log('ZkOBS address:', zkOBS.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

