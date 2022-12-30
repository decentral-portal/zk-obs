import { LoggerModule } from '@common/logger/logger.module';
import { CommandBus } from '@nestjs/cqrs';
import { Test } from '@nestjs/testing';
import { TsAuctionController } from '@ts-rollup-api/infrastructure/adapters/auction-market.controller';
import { TsRollupService } from '@ts-rollup-api/infrastructure/service/rollup.service';
import * as crypto from 'crypto';
import { TsTransactionController } from '@ts-rollup-api/infrastructure/adapters/transaction.controller';
import { AuctionBondTokenEntity } from '@common/ts-typeorm/auctionOrder/auctionBondToken.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import { MarketPairInfoService } from '@common/ts-typeorm/auctionOrder/marketPairInfo.service';
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
})
describe('[Unit] auction-market.controller', () => {
  // 1. setup test environment before all test run
  let tsRollupService: TsRollupService;
  let commandBus: CommandBus;
  let tsAuctionController: TsAuctionController;
  let tsTransactionController: TsTransactionController;
  beforeAll(async() => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        LoggerModule,
      ],
      providers: [
        {
          provide: TsRollupService, useClass: TsRollupService,
        },
        {
          provide: CommandBus, useClass: CommandBus,
        },
        {
          provide: TsAuctionController, useClass: TsAuctionController,
        },
        {
          provide: TsTransactionController, useClass: TsTransactionController
        },
        {
          provide: getRepositoryToken(AuctionBondTokenEntity), 
          useValue: () =>({

          })
        },
        {
          provide: Connection, useValue: null,
        },
        {
          provide: MarketPairInfoService, useValue: null,
        }
      ]
    }).compile();
    // logger = moduleRef.get<PinoLogger>(PinoLogger);
    tsRollupService = moduleRef.get<TsRollupService>(TsRollupService);
    commandBus = moduleRef.get<CommandBus>(CommandBus);
    tsAuctionController = moduleRef.get<TsAuctionController>(TsAuctionController);
    tsTransactionController = moduleRef.get<TsTransactionController>(TsTransactionController);
  });
  it('tsAuctionController is defined', async () => {
    expect(tsAuctionController).toBeDefined();
  });
  // it('tsAuctionController borrow after register', async () => {
  //   const now = new Date();
  //   const maturityDate = new Date();
  //   maturityDate.setDate(now.getDate() + 7);
  //   const expiredTime = new Date();
  //   expiredTime.setDate(now.getDate() + 10);
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
  //   // 2 use registered account to borrow
  //   const result = await tsAuctionController.borrow({
  //     reqType: TsTxType.AUCTION_BORROW,
  //     L2AddrFrom: '101',
  //     L2AddrTo: TsSystemAccountAddress.AUCTION_ADDR,
  //     L2TokenAddrCollateral: TsTokenAddress.DAI,
  //     collateralAmt: '100',
  //     nonce: '100',
  //     maturityDate: maturityDate.getTime().toString(),
  //     interest: '1',
  //     borrowingAmt: '100',
  //     L2TokenAddrBorrowing: TsTokenAddress.USDC,
  //     eddsaSig: {
  //       R8: [rawX, rawY],
  //       S: '19'
  //     },
  //     ecdsaSig: '19',
  //     expiredTime: expiredTime.getTime().toString()
  //   });
  //   expect(result).toEqual({blockNumber: '2'});
  // });
  // it('tsAuctionController cancel after register and borrow', async () => {
  //   const now = new Date();
  //   const maturityDate = new Date();
  //   maturityDate.setDate(now.getDate() + 7);
  //   const expiredTime = new Date();
  //   expiredTime.setDate(now.getDate() + 10);
  //   const publicKey = generatePublicKey();
  //   rawX = publicKey.rawX;
  //   rawY = publicKey.rawY;
  //   const circomlibjs = require('circomlibjs');
  //   let EdDSA: any;
  //   const asyncEdDSA = circomlibjs.buildEddsa();
  //   EdDSA = await asyncEdDSA;
  //   await tsTransactionController.register({
  //     L1Address: '0x319AbFF6695E87d5E402F803045AaD0F07b5dA7d',
  //     L2AddrFrom: '101',
  //     tsPubKey: [rawX, rawY],
  //     reqType: TsTxType.REGISTER,
  //     amount: '100',
  //     L2TokenAddr: TsTokenAddress.DAI
  //   });
  //   await tsAuctionController.borrow({
  //     reqType: TsTxType.AUCTION_BORROW,
  //     L2AddrFrom: '101',
  //     L2AddrTo: TsSystemAccountAddress.AUCTION_ADDR,
  //     L2TokenAddrCollateral: TsTokenAddress.DAI,
  //     collateralAmt: '100',
  //     nonce: '100',
  //     maturityDate: maturityDate.getTime().toString(),
  //     interest: '1',
  //     borrowingAmt: '100',
  //     L2TokenAddrBorrowing: TsTokenAddress.USDC,
  //     eddsaSig: {
  //       R8: [rawX, rawY],
  //       S: '19'
  //     },
  //     ecdsaSig: '19',
  //     expiredTime: expiredTime.getTime().toString()
  //   });
  //   const result = await tsAuctionController.cancel({
  //     reqType: TsTxType.AUCTION_CANCEL,
  //     L2AddrFrom: TsSystemAccountAddress.AUCTION_ADDR,
  //     L2AddrTo: '101',
  //     L2TokenAddrRefunded: TsTokenAddress.USDC,
  //     amount: '80',
  //     nonce: '101',
  //     orderLeafId: '10',
  //     eddsaSig: {
  //       R8: [rawX, rawY],
  //       S: '19'
  //     },
  //     ecdsaSig: '19',
  //   });
  //   console.log(result);
  //   expect(result).toEqual({blockNumber: 2});
  // });
  // it('tsAunctionController lend after register', async () => {
  //   const now = new Date();
  //   const maturityDate = new Date();
  //   maturityDate.setDate(now.getDate() + 7);
  //   const expiredTime = new Date();
  //   expiredTime.setDate(now.getDate() + 10);
  //   // 1 register account
  //   await tsTransactionController.register({
  //     L1Address: '0x319AbFF6695E87d5E402F803045AaD0F07b5dA7d',
  //     L2AddrFrom: '101',
  //     tsPubKey: [rawX, rawY],
  //     reqType: TsTxType.REGISTER,
  //     amount: '100',
  //     L2TokenAddr: TsTokenAddress.DAI
  //   });
  //   // 2 use register account lend
  //   const result = await tsAuctionController.lend({
  //     reqType: TsTxType.AUCTION_LEND,
  //     L2AddrFrom: '101',
  //     L2AddrTo: TsSystemAccountAddress.AUCTION_ADDR,
  //     L2TokenAddrLending: TsTokenAddress.DAI,
  //     lendingAmt: '20',
  //     nonce: '100',
  //     maturityDate: maturityDate.getTime().toString(),
  //     eddsaSig: {
  //       R8: [rawX, rawY],
  //       S: '19'
  //     },
  //     ecdsaSig: '19',
  //     interest: '1',
  //     expiredTime: expiredTime.getTime().toString()
  //   });
  //   expect(result).toEqual({blockNumber: '2'});
  // });
  // it('tsAunctionController get', async () => {
  //   const result = await tsAuctionController.getOrderList();
  //   expect(result).toBe('getOrderList');
  // })
});