import { FakeLoggerService } from '@common/logger/adapters/fake/FakeLogger.service';
import { PinoLoggerService } from '@common/logger/adapters/real/pinoLogger.service';
import { Test } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { ExecutionContext } from '@nestjs/common';
import { CheckWithdrawOrderGuard } from '../../src/infrastructure/guards/check-withdraw-order.guard';
import { TsTokenAddress } from '@common/ts-typeorm/account/dto/ts-type';
import { L2BalanceRepository } from '@ts-rollup-api/infrastructure/ports/L2Balance.repository';
import { GetL2BalanceRequestDto } from '@ts-rollup-api/infrastructure/dtos/getL2BalanceRequest.dto';
describe('[Unit] checkWithdrawOrderGuard', () => {
  let checkWithdrawrOrderGuard: CheckWithdrawOrderGuard;
  const tokenInfoList = [
    {
      L2Address: '100',
      id: BigInt(0),
      hash: BigInt(10),
      L2TokenAddrLending: TsTokenAddress.DAI,
      availableAmt: '0',
      lockedAmt: '10'
    },
    {
      L2Address: '100',
      id: BigInt(1),
      hash: BigInt(10),
      L2TokenAddrLending: TsTokenAddress.USDC,
      availableAmt: '10',
      lockedAmt: '0'
    },
    {
      L2Address: '100',
      id: BigInt(2),
      hash: BigInt(10),
      L2TokenAddrLending: TsTokenAddress.USDT,
      availableAmt: '10',
      lockedAmt: '0'
    },
    {
      L2Address: '100',
      id: BigInt(5),
      hash: BigInt(10),
      L2TokenAddrLending: TsTokenAddress.WBTC,
      availableAmt: '100',
      lockedAmt: '0'
    },
  ];
  beforeEach(() => {
    jest.setTimeout(30000);
  });
  beforeAll(async() => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        {
          provide: CheckWithdrawOrderGuard, useClass: CheckWithdrawOrderGuard,
        },
        {
          provide: PinoLoggerService, useClass: FakeLoggerService,
        },
        {
          provide: L2BalanceRepository, useValue: {
            getL2RealBalance: jest.fn((
              lenderInfo: GetL2BalanceRequestDto,
            ) => {
              const result = tokenInfoList.filter((tokenInfo) => {
                return lenderInfo.L2TokenAddrList?.includes(tokenInfo.L2TokenAddrLending) 
                && tokenInfo.L2Address == lenderInfo.L2Address;
              });
              return {
                list: result
              };
            })
          }
        }
      ]
    }).compile();
    checkWithdrawrOrderGuard = moduleRef.get<CheckWithdrawOrderGuard>(CheckWithdrawOrderGuard);
  });
  it('check CheckWithdrawOrderGuard is defined', async () => {
    expect(checkWithdrawrOrderGuard).toBeDefined();
  });
  it('withdraw more the available Token should be false', async() => {
    const context = createMock<ExecutionContext>();
    context.switchToHttp().getRequest.mockReturnValue({
      json: () => {
        return {
          L2AddrFrom: '100',
          L2TokenAddr: TsTokenAddress.DAI,
          amount: '5'
        }
      }
    });
    const result = await checkWithdrawrOrderGuard.canActivate(context);
    expect(result).toBeFalsy();
  });
  it('withdraw more enough Token should be true', async() => {
    const context = createMock<ExecutionContext>();
    context.switchToHttp().getRequest.mockReturnValue({
      json: () => {
        return {
          L2AddrFrom: '100',
          L2TokenAddr: TsTokenAddress.USDC,
          amount: '5'
        }
      }
    });
    const result = await checkWithdrawrOrderGuard.canActivate(context);
    expect(result).toBeTruthy();
  });
  it('withdraw with not existed L2 address token should be false', async() => {
    const context = createMock<ExecutionContext>();
    context.switchToHttp().getRequest.mockReturnValue({
      json: () => {
        return {
          L2AddrFrom: '100',
          L2TokenAddr: TsTokenAddress.USDC,
          amount: '11'
        }
      }
    });
    const result = await checkWithdrawrOrderGuard.canActivate(context);
    expect(result).toBeFalsy();
  })
});