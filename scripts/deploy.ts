import fs from 'fs';
import { ethers } from 'hardhat';
import { TsRollupSigner } from 'zk-obs-sdk';
import { ERC20FreeMint, ZkOBS } from '../typechain-types';
import { deploy } from '../test/utils';
import { resolve } from 'path';
import { arrayify } from 'ethers/lib/utils';
const circomlibjs = require('circomlibjs');
const { createCode, generateABI } = circomlibjs.poseidonContract;
const outputPath = resolve(__dirname, './deploy.json');
const IS_PRE_TEST_DEPOSIT = process.env.IS_PRE_TEST_DEPOSIT === 'TRUE';
const PRIV_HASH_ITERATIONS = 100;

async function main() {
  const { operator, user1, user2, zkUSDC, wETH, zkOBS } = await deploy();
  fs.writeFileSync(
    outputPath,
    `${JSON.stringify(
      {
        operator: operator.address,
        user1: user1.address,
        user2: user2.address,
        zkUSDC: zkUSDC.address,
        wETH: wETH.address,
        zkOBS: zkOBS.address,
      },
      null,
      2,
    )}\n`,
  );

  if (IS_PRE_TEST_DEPOSIT) {
    console.log('Pre test deposit');
    const [operator, ...accounts] = await ethers.getSigners();
    await zkOBS.connect(operator).addToken(zkUSDC.address);
    const network = await ethers.provider.detectNetwork();

    for (let index = 0; index < accounts.length; index++) {
      const acc = accounts[index];
      const mintAmt = await zkUSDC.MAX_MINT_AMOUNT();
      await zkUSDC.connect(acc).mint(mintAmt);
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
      await zkUSDC
        .connect(acc)
        .approve(zkOBS.address, ethers.constants.MaxUint256);
      await zkOBS
        .connect(acc)
        .depositERC20(zkUSDC.address, ethers.utils.parseUnits('6000', 6));
      console.log('Deposit ERC20', {
        zkUSDC: zkUSDC.address,
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
async function sign() {
  const td = new utils.TypedDataEncoder(
    {
      EIP712Domain: [
        {
          name: 'name',
          type: 'string',
        },
        {
          name: 'version',
          type: 'string',
        },
        {
          name: 'chainId',
          type: 'uint256',
        },
        {
          name: 'verifyingContract',
          type: 'address',
        },
      ],
      Person: [
        {
          name: 'name',
          type: 'string',
        },
        {
          name: 'wallet',
          type: 'address',
        },
      ],
      Mail: [
        {
          name: 'from',
          type: 'Person',
        },
        {
          name: 'to',
          type: 'Person',
        },
        {
          name: 'contents',
          type: 'string',
        },
      ],
    },
    {
      name: 'Mail DApp',
      version: '1.0.1',
      chainId: 1,
      verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
    },
  );

  const typedData = td.encode(
    {
      from: {
        name: 'James Bond',
        wallet: '0xC8e1F3B9a0CdFceF9fFd2343B943989A22517b26',
      },
      to: {
        name: 'John Snow',
        wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
      },
      contents: 'Hey hi',
    },
    'Mail',
  );

  const signature = await wallet.signTypedData(typedData);
}
