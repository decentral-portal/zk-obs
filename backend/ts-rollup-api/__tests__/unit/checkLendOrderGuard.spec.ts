import { createMock } from '@golevelup/ts-jest';
import { Test } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { FakeLoggerService } from '@common/logger/adapters/fake/FakeLogger.service';
import { PinoLoggerService } from '@common/logger/adapters/real/pinoLogger.service';
import { TsTokenAddress } from '@common/ts-typeorm/account/dto/ts-type';
import { CheckLendOrderGuard } from '@ts-rollup-api/infrastructure/guards/check-lend-order.guard';
import { L2BalanceRepository } from '@ts-rollup-api/infrastructure/ports/L2Balance.repository';
import { GetL2BalanceRequestDto } from '@ts-rollup-api/infrastructure/dtos/getL2BalanceRequest.dto';
describe('[Unit] checkLendOrderGuard', () => {
  let checkLendOrderGuard: CheckLendOrderGuard;
  const tokenInfoList = [
    {
      accountId: '100',
      id: BigInt(0),
      hash: BigInt(10),
      L2TokenAddrLending: TsTokenAddress.DAI,
      availableAmt: '0',
      lockedAmt: '10'
    },
    {
      accountId: '100',
      id: BigInt(1),
      hash: BigInt(10),
      L2TokenAddrLending: TsTokenAddress.USDC,
      availableAmt: '10',
      lockedAmt: '0'
    },
    {
      accountId: '100',
      id: BigInt(2),
      hash: BigInt(10),
      L2TokenAddrLending: TsTokenAddress.USDT,
      availableAmt: '10',
      lockedAmt: '0'
    },
    {
      accountId: '100',
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
          provide: CheckLendOrderGuard, useClass: CheckLendOrderGuard,
        },
        {
          provide: PinoLoggerService, useClass: FakeLoggerService
        },
        {
          provide: L2BalanceRepository, useValue: {
            getL2RealBalance: jest.fn((
              lenderInfo: GetL2BalanceRequestDto,
            ) => {
              const result = tokenInfoList.filter((tokenInfo) => {
                return lenderInfo.L2TokenAddrList?.includes(tokenInfo.L2TokenAddrLending) 
                && tokenInfo.accountId == lenderInfo.accountId;
              });
              return {
                list: result
              };
            })
          }
        }
      ]
    }).compile();
    checkLendOrderGuard = moduleRef.get<CheckLendOrderGuard>(CheckLendOrderGuard);
  });
  it('should be defined', async () => {
    expect(checkLendOrderGuard).toBeDefined();
  });
  it('lend with enough availableAmt Token should be true', async () => {
    const context = createMock<ExecutionContext>();
    context.switchToHttp().getRequest.mockReturnValue({
      json: () => {
        return {
          L2AddrFrom: '100',
          L2TokenAddrLending: TsTokenAddress.USDC,
          lendingAmt: '5'
        };
      }
    });
    const result = await checkLendOrderGuard.canActivate(context);
    expect(result).toBeTruthy();
  });
  it('lend with not enough availableAmt Token should be false', async () => {
    const context = createMock<ExecutionContext>();
    context.switchToHttp().getRequest.mockReturnValue({
      json: () => {
        return {
          L2AddrFrom: '100',
          L2TokenAddrLending: TsTokenAddress.DAI,
          lendingAmt: '5'
        };
      }
    });
    const result = await checkLendOrderGuard.canActivate(context);
    expect(result).toEqual(false);
  });
});