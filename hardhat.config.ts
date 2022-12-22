/* eslint-disable node/no-extraneous-import */
import '@nomicfoundation/hardhat-chai-matchers';
import '@nomicfoundation/hardhat-toolbox';
import '@nomiclabs/hardhat-ethers';
import '@nomiclabs/hardhat-etherscan';
import '@openzeppelin/hardhat-upgrades';
import '@tenderly/hardhat-tenderly';
import '@typechain/hardhat';
import 'hardhat-contract-sizer';
import 'hardhat-docgen';
import 'hardhat-gas-reporter';
import 'hardhat-spdx-license-identifier';
import 'hardhat-storage-layout';
import 'hardhat-tracer';
import { HardhatUserConfig, task } from 'hardhat/config';
import 'solidity-coverage';
import 'hardhat-contract-sizer';

require('dotenv').config();
task('accounts', 'Prints the list of accounts', async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

task('storage-layout', 'Prints the storage layout', async (_, hre) => {
  await hre.storageLayout.export();
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more
const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: process.env.SOLC_VERSION || '0.8.17',
        settings: {
          optimizer: {
            enabled: true,
            runs: 1000,
          },
          outputSelection: {
            '*': {
              '*': ['storageLayout'],
            },
          },
        },
      },
      {
        version: '0.4.18',
      },
    ],
  },
  contractSizer: {
    alphaSort: true,
    runOnCompile: true,
    strict: true,
  },
  spdxLicenseIdentifier: {
    runOnCompile: false,
  },
  gasReporter: {
    enabled: getBoolean(process.env.REPORT_GAS, true),
    coinmarketcap: process.env.COINMARKETCAP_API_KEY || '',
    gasPriceApi:
      process.env.GAS_PRICE_API ||
      'https://api.etherscan.io/api?module=proxy&action=eth_gasPrice',
    token: 'ETH',
    currency: 'USD',
  },
  networks: {
    hardhat: {
      allowUnlimitedContractSize: getBoolean(
        process.env.ALLOW_UNLIMITED_CONTRACT_SIZE,
        false,
      ),
    },
    custom: {
      url: process.env.CUSTOM_NETWORK_URL || '',
      accounts: {
        count: getNumber(process.env.CUSTOM_NETWORK_ACCOUNTS_COUNT, 10),
        mnemonic: process.env.CUSTOM_NETWORK_ACCOUNTS_MNEMONIC || '',
      },
    },
    goerli: {
      url: process.env.GOERLI_RPC_URL || '',
      accounts:
        process.env.GOERLI_KEY !== undefined ? [process.env.GOERLI_KEY] : [],
    },
  },
  etherscan: {
    apiKey: {
      goerli: process.env.ETHERSCAN_API_KEY || '',
    },
  },
  docgen: {
    path: './docs',
    clear: true,
    runOnCompile: true,
  },
  typechain: {
    // outDir: 'types',
    target: 'ethers-v5',
  },
};

export default config;

function getBoolean(str: string, _default: boolean) {
  try {
    if (str === '' || typeof str === 'undefined') return _default;
    return !!JSON.parse(str.toLowerCase());
  } catch (error) {
    throw new Error(`'${str}' is not a boolean`);
  }
}

function getNumber(str: string, _default: number) {
  if (str === '' || typeof str === 'undefined') return _default;
  const num = JSON.parse(str);
  if (typeof num === 'number') {
    return num;
  }
  throw new Error(`'${str}' is not a number`);
}
