import { FakeLoggerService } from '@common/logger/adapters/fake/FakeLogger.service';
import { PinoLoggerService } from '@common/logger/adapters/real/pinoLogger.service';
import { LoggerModule } from '@common/logger/logger.module';
import { MarketPairInfoService } from '@common/ts-typeorm/auctionOrder/marketPairInfo.service';
import { CommandBus } from '@nestjs/cqrs';
import { Test } from '@nestjs/testing';
import { TsAccountController } from '@ts-rollup-api/infrastructure/adapters/account.controller';
import { TsTransactionController } from '@ts-rollup-api/infrastructure/adapters/transaction.controller';
import { AccountInfoService } from '@ts-rollup-api/infrastructure/service/accountInfo.service';
import { AvailableService } from '@ts-rollup-api/infrastructure/service/available.service';
import { TsTokenAddress, TsTxType } from '@ts-sdk/domain/lib/ts-types/ts-types';
import * as crypto from 'crypto';
import { Connection } from 'typeorm';
let rawX: string;
let rawY: string;
const generatePublicKey = (() => {
  const {publicKey, privateKey } = crypto.generateKeyPairSync('ec', {
    namedCurve: 'secp256k1',
    // namedCurve: 'secp128r1',
  });
  const private_Key = privateKey.export({ type: 'sec1', format: 'der' }).toString('hex');
  const key = publicKey.export({ type: 'spki', format: 'der' });
  return {
    privateKey: private_Key,
    publickey: key.toString('hex'),
    rawX: BigInt('0x' + key.subarray(-64, -32).toString('hex')).toString(10),
    rawY: BigInt('0x' + key.subarray(-32).toString('hex')).toString(10)
  };
});
let EdDSA: any;
describe('[UnitTest] account.controller test', () => {
  // setup enviroment for lanch test
  let tsAccountController: TsAccountController;
  let tsTransactionController: TsTransactionController;
  let logger: PinoLoggerService;
  beforeEach(() => {
    jest.setTimeout(30000);
  });
  beforeAll(async ()=> {
    const circomlibjs = require('circomlibjs');
    const asyncEdDSA = circomlibjs.buildEddsa();
    EdDSA = asyncEdDSA;
    const moduleRef = await Test.createTestingModule({
      imports: [
        LoggerModule,
      ],
      providers: [
        {
          provide: PinoLoggerService, useClass: FakeLoggerService
        },
        {
          provide: TsAccountController, useClass: TsAccountController
        },
        {
          provide: AvailableService, useValue: null,
        },
        {
          provide: AccountInfoService, useValue: null,
        },
        {
          provide: TsTransactionController, useClass: TsTransactionController
        },
        {
          provide: CommandBus, useClass: CommandBus
        },
        {
          provide: Connection, useValue: null,
        },
        {
          provide: MarketPairInfoService, useValue: null,
        }
      ]
    }).compile();
    tsAccountController = moduleRef.get<TsAccountController>(TsAccountController);
    tsTransactionController = moduleRef.get<TsTransactionController>(TsTransactionController);
    logger = moduleRef.get<PinoLoggerService>(PinoLoggerService);
  });
  it('tsAccountController is defined', async () => {
    expect(tsAccountController).toBeDefined();
  });
  // it('tsAccountController get balance after register', async () => {
  //   const publicKey = generatePublicKey();
  //   rawX = publicKey.rawX;
  //   rawY = publicKey.rawY;
  //   // 1 register account
  //   await tsTransactionController.register({
  //     L1Address: '0x319AbFF6695E87d5E402F803045AaD0F07b5dA7d',
  //     L2AddrFrom: '101',
  //     tsPubKey: [rawX, rawY],
  //     reqType: TsTxType.REGISTER,
  //     amount: '100',
  //     L2TokenAddr: TsTokenAddress.DAI
  //   });
  //   const result = await tsAccountController.getL2Balances({
  //     L2TokenAddr: [TsTokenAddress.DAI, TsTokenAddress.USDC, TsTokenAddress.USDT, TsTokenAddress.WBTC],
  //     accountId: '101'
  //   });
  //   expect(result).toHaveProperty('list');
  //   expect(result.list.length).toEqual(4);
  // });
  // it('tsAccountController getAccountInfo after register', async () => {
  //   const publicKey = generatePublicKey();
  //   rawX = publicKey.rawX;
  //   rawY = publicKey.rawY;
  //   // 1 register account
  //   await tsTransactionController.register({
  //     L1Address: '0x319AbFF6695E87d5E402F803045AaD0F07b5dA7d',
  //     L2AddrFrom: '101',
  //     tsPubKey: [rawX, rawY],
  //     reqType: TsTxType.REGISTER,
  //     amount: '100',
  //     L2TokenAddr: TsTokenAddress.DAI
  //   });
  //   const result = await tsAccountController.getAccountInfo({
  //     L1Address: '0x319AbFF6695E87d5E402F803045AaD0F07b5dA7d'
  //   });
  //   expect(result.L1Address).toEqual('0x319AbFF6695E87d5E402F803045AaD0F07b5dA7d'.toLowerCase());
  // });
});