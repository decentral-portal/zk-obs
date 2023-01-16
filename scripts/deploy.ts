import fs from 'fs';
import { ethers } from 'hardhat';
import { TsRollupSigner } from 'term-structure-sdk';
import { ERC20FreeMint, ZkOBS } from '../typechain-types';
import { deploy } from '../test/utils';
import { resolve } from 'path';
import { arrayify } from 'ethers/lib/utils';
import initStates from '../test/phase5-devw-20-10-8-2-16-50/initStates.json';
import { BigNumber } from 'ethers';
const circomlibjs = require('circomlibjs');
const { createCode, generateABI } = circomlibjs.poseidonContract;
const outputPath = resolve(__dirname, './deploy.json');
const IS_PRE_TEST_DEPOSIT = process.env.IS_PRE_TEST_DEPOSIT === 'TRUE';
const PRIV_HASH_ITERATIONS = 100;

async function main() {
  const { operator, user1, user2, wETH, wBTC, USDT, USDC, DAI, zkOBS } =
    await deploy(initStates.stateRoot);
  fs.writeFileSync(
    outputPath,
    `${JSON.stringify(
      {
        operator: operator.address,
        user1: user1.address,
        user2: user2.address,
        wETH: wETH.address,
        wBTC: wBTC.address,
        USDT: USDT.address,
        USDC: USDC.address,
        DAI: DAI.address,
        zkOBS: zkOBS.address,
      },
      null,
      2,
    )}\n`,
  );
  await zkOBS.connect(operator).addToken(wBTC.address, 8);
  await zkOBS.connect(operator).addToken(USDT.address, 6);
  await zkOBS.connect(operator).addToken(USDC.address, 6);
  await zkOBS.connect(operator).addToken(DAI.address, 18);

  if (IS_PRE_TEST_DEPOSIT) {
    console.log('Pre test deposit');
    const [operator, ...accounts] = await ethers.getSigners();
    const network = await ethers.provider.detectNetwork();

    for (let index = 0; index < accounts.length; index++) {
      const acc = accounts[index];
      const mintAmt = BigNumber.from('100000000000000000');
      await USDC.connect(acc).mint(mintAmt);
      console.log('Mint zkUSDC', {
        account: acc.address,
        amount: mintAmt,
        id: network.chainId,
      });
      const typeData = {
        domains: {
          name: 'zkOBS',
          version: '1',
          chainId: network.chainId,
          verifyingContract: zkOBS.address,
        },
        types: {
          Main: [
            { name: 'Authentication', type: 'string' },
            { name: 'Action', type: 'string' },
          ],
        },
        valuse: {
          Authentication: 'zkOBS',
          Action: 'Authentication on zkOBS',
        },
      };
      const signature = await acc._signTypedData(
        typeData.domains,
        typeData.types,
        typeData.valuse,
      );
      let hash = signature;
      for (let index = 0; index < PRIV_HASH_ITERATIONS; index++) {
        hash = ethers.utils.keccak256(arrayify(hash));
      }
      const tsPrivKeyBuf = Buffer.from(hash.replace('0x', ''), 'hex');
      const tsSigner = new TsRollupSigner(tsPrivKeyBuf);
      console.log('tsSigner', {
        typeData,
        signature,
        hash,
        tsPubKey: tsSigner.tsPubKey,
      });

      await zkOBS
        .connect(acc)
        .registerETH(tsSigner.tsPubKey[0], tsSigner.tsPubKey[1], {
          value: ethers.utils.parseEther('10'),
        });
      console.log('Deposit ETH', {
        amount: ethers.utils.parseEther('10'),
      });
      await USDC.connect(acc).approve(
        zkOBS.address,
        ethers.constants.MaxUint256,
      );
      await zkOBS
        .connect(acc)
        .depositERC20(USDC.address, ethers.utils.parseUnits('6000', 6));
      console.log('Deposit ERC20', {
        zkUSDC: USDC.address,
        amount: ethers.utils.parseUnits('6000', 6),
      });
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
