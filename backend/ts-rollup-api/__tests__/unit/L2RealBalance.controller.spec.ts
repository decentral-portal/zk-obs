import { TsTokenAddress } from '@common/ts-typeorm/account/dto/ts-type';
import { Test } from '@nestjs/testing';
import { L2RealBalanceController } from '@ts-rollup-api/infrastructure/adapters/L2RealBalance.controller';
import { L2BalanceRepository } from '@ts-rollup-api/infrastructure/ports/L2Balance.repository';
import { L2RealBalanceServiceFake } from '@ts-rollup-api/infrastructure/service/L2RealBalance.service.fake';


describe('[UnitTest] L2RealBalanceController', () => {
  let l2RealBalanceController: L2RealBalanceController;
  let l2RealBalanceService: L2BalanceRepository;
  beforeEach(() => {
    jest.setTimeout(30000);
  });
  beforeAll(async ()=> {
    const moduleRef = await Test.createTestingModule({
      providers: [
        {
          provide: L2RealBalanceController, useClass: L2RealBalanceController
        },
        {
          provide: L2BalanceRepository, useClass: L2RealBalanceServiceFake,
        },
      ]
    }).compile();
    l2RealBalanceController = moduleRef.get<L2RealBalanceController>(L2RealBalanceController);
    l2RealBalanceService = moduleRef.get<L2BalanceRepository>(L2BalanceRepository);
  });
  it('L2RealBalanceController is defined', async () => {
    expect(L2RealBalanceController).toBeDefined();
  });
  it('When L2RealBalanceController is called with missing L2Address', async() => {
    await expect(l2RealBalanceController.getL2RealBalance('', [])).rejects.toThrowError('L2Address is not provided');
  });
  it('When L2RealBalanceController is called with missing tokenIds', async() => {
    const result = await l2RealBalanceController.getL2RealBalance('100',[]);
    expect(result).toEqual({
      list: [{
        L2TokenAddr: '8',
        availableAmt: '100',
        lockedAmt: '0',
      },{
        L2TokenAddr: '9',
        availableAmt: '10',
        lockedAmt: '60',
      }, {
        L2TokenAddr: '10',
        availableAmt: '0',
        lockedAmt: '10',
      }]
    });
  });
  it('When L2RealBalanceController is called with tokenIds', async() => {
    const result = await l2RealBalanceController.getL2RealBalance('100',[TsTokenAddress.DAI]);
    expect(result).toEqual({
      list: [{
        L2TokenAddr: '10',
        availableAmt: '0',
        lockedAmt: '10',
      }]
    });
  });
});