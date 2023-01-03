import { FakeLoggerService } from '@common/logger/adapters/fake/FakeLogger.service';
import { PinoLoggerService } from '@common/logger/adapters/real/pinoLogger.service';
import { AccountController } from '@common/rbac/infrastructure/adapter/controllers/account.controller';
import { AuthService } from '@common/rbac/infrastructure/adapter/services/authentication.service';
import { FakeAccountInfoRepository } from '@common/rbac/infrastructure/adapter/services/fakeAccontInfo.repository';
import { HashingService } from '@common/rbac/infrastructure/adapter/services/hashing.service';
import { AccountInfoRepository } from '@common/rbac/infrastructure/ports/accountInfo.repository';
import { AuthServiceInterface } from '@common/rbac/infrastructure/ports/authentication.service';
import { HashingServiceInterface } from '@common/rbac/infrastructure/ports/hashing.service';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';

describe('[UnitTest] AccountController', () => {
  let accountController: AccountController;
  const counter = 0;
  beforeEach(() => {
    jest.setTimeout(30000);
  });
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [  
        JwtModule.register({signOptions: { expiresIn: '15m' }}) 
      ],
      controllers: [AccountController],
      providers: [
        {
          provide: PinoLoggerService,
          useClass: FakeLoggerService
        },
        {
          provide: HashingServiceInterface,
          useClass: HashingService
        },
        {
          provide: AuthServiceInterface,
          useClass: AuthService
        },
        {
          provide: AccountInfoRepository,
          useClass: FakeAccountInfoRepository
        },
        {
          provide: ConfigService,
          useValue: {get: jest.fn((key:string):string => {
            switch(key) {
              case 'ACCESS_TOKEN_SECRET':
                return 'yourAccessTokenSecretKey';
              case 'REFRESH_TOKEN_SECRET':
                return 'yourRefreshTokenSecretKey';
              default:
                return '';
            }
          })}
        }
      ]
    }).compile();
    accountController = moduleRef.get<AccountController>(AccountController);
  });
  it('should be defined', async() => {
    expect(accountController).toBeDefined();
  });
  describe('[signUp]', () => {
    it('When signUp with a normal User', async () => {
      const email = 'ps@gmail.com';
      const result = await accountController.signUp({
        email: 'ps@gmail.com',
        password: 'password',
        L1Address: '319AbFF6695E87d5E402F803045AaD0F07b5dA7d'
      });
      expect(result).toEqual({
        message: `account for email: ${email} create successfully`
      });
    });
    it('When signUp with a existed User', async () => {
      const existedEmail = 'yuanyu.liang@tkspring.com';
      await expect(accountController.signUp({
        email: existedEmail,
        password: 'password',
        L1Address: '319AbFF6695E87d5E402F803045AaD0F07b5dA7d'
      })).rejects.toThrowError('Account already exists, please use another L1Address or email');
    });
  });
  describe('[signIn]', () => {
    it('When signIn with a normal User', async () => {
      const email = 'yuanyu.liang@tkspring.com';
      const password = 'password';
      const result = await accountController.signIn({
        email,
        password
      });
      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('refresh_token');
    });
    it('When signIn with a wrong password', async () => {
      const email = 'yuanyu.liang@tkspring.com';
      const password = 'passw0rd';
      await expect(accountController.signIn({
        email,
        password
      })).rejects.toThrowError('Incorrect password');
    });
    it('When signIn with a not exist email', async () => {
      const email = 'yuanyu.liang1@tkspring.com';
      const password = 'password';
      await expect(accountController.signIn({
        email,
        password
      })).rejects.toThrowError('This user do not exists.');
    }); 
  });
});