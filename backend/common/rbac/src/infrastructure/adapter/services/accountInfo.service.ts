import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PinoLoggerService } from '@common/logger/adapters/real/pinoLogger.service';
import { Email } from '@common/rbac/domain/value-objects/email';
import { from, Observable, map } from 'rxjs';
import { AccountInfo, AccountInfoWithoutPassword, AccountNonceInfo } from '@common/rbac/domain/entities/accountInfo';
import { UserNotFoundException } from '@common/rbac/domain/exceptions/userNotFound.exception';
import { L1Address } from '@common/rbac/domain/value-objects/l1address';
import { accountId } from '@common/rbac/domain/value-objects/accountId';
import { HashedPassword } from '@common/rbac/domain/value-objects/password';
import { RefreshToken } from '@common/rbac/domain/value-objects/refreshToken';
import { Role } from '@common/rbac/domain/value-objects/role';
import { AccountInfoRepository } from '@common/rbac/infrastructure/ports/accountInfo.repository';
import { Nonce } from '@common/rbac/domain/value-objects/nonce';
import { InjectRepository } from '@nestjs/typeorm';
import { AccountInformation } from '@common/ts-typeorm/account/accountInformation.entity';
import { MoreThan, Repository } from 'typeorm';
import { EmailAlreadyExistsException } from '@common/rbac/domain/exceptions/emailAlreadyExists.exeception';
import { HashingServiceInterface } from '@common/rbac/infrastructure/ports/hashing.service';

@Injectable()
export class AccountInfoService implements AccountInfoRepository{
  private currentCounter: bigint = 0n;
  constructor(private readonly logger: PinoLoggerService,
    @InjectRepository(AccountInformation)
    private readonly accountInformationRepository: Repository<AccountInformation>,
    private readonly hashingService: HashingServiceInterface) {
    this.logger.setContext('AccountInfoService');
    this.getAccountInfoCount().then((count) => {
      this.currentCounter = BigInt(count) + 100n;
      this.logger.log(`Current address count is ${this.currentCounter}`);
    });
  }
  async getAccountInfoCount(): Promise<number> {
    return this.accountInformationRepository.count({
      where: {
        accountId: MoreThan('100')
      }
    });
  } 
  async createAccount(accountInfo: AccountInfo): Promise<AccountInfo>{
    const hashedPassword = await this.hashingService.hashPlainPassword(HashedPassword.check(accountInfo.password));
    const accountIndex = this.currentCounter + 1n;
    const checkEmailAccount = await this.accountInformationRepository.findOne({
      where: {
        email: accountInfo.email
      }
    });
    if (checkEmailAccount !== null) {
      throw new EmailAlreadyExistsException(`email ${accountInfo.email} already exists`);
    }
    const account = this.accountInformationRepository.create({
      L1Address: accountInfo.L1Address,
      accountId: accountIndex.toString(),
      lastedLoginIp: '127.0.0.1',
      lastLoginTime: new Date(),
      email: accountInfo.email,
      password: hashedPassword,
      updatedBy: 'Server'
    });
    await this.accountInformationRepository.insert(account);
    this.currentCounter += 1n;
    return {
      L1Address: L1Address.check(account.L1Address),
      accountId: accountId.check(BigInt(account.accountId)),
      email: Email.check(account.email),
      password: HashedPassword.check(account.password),
      role: Role.check(account.role)
    };
  }

  async findOneOrFail(_L1Address: L1Address): Promise<AccountNonceInfo> {
    try {
      const result = await this.accountInformationRepository.findOneOrFail({
        where: {
          L1Address: _L1Address
        },
        relations: {
          accountMerkleTreeNode: true
        }
      });
      const nonce = result.accountMerkleTreeNode? result.accountMerkleTreeNode.accountLeafNode.nonce.toString(): '0';
      return {
        L1Address: L1Address.check(result.L1Address),
        accountId: accountId.check(BigInt(result.accountId.toString())),
        email: Email.check(result.email),
        password: HashedPassword.check(result.password),
        role: Role.check(result.role),
        nonce: Nonce.check(BigInt(nonce))    
      };
    } catch (reason: unknown) {
      this.logger.error(reason);
      throw new UserNotFoundException();
    }
  }
  async findOneByaccountId(_accountId: accountId): Promise<AccountNonceInfo> {
    try {
      const result = await this.accountInformationRepository.findOneOrFail({
        where: {
          accountId: _accountId.toString()
        },
        relations: {
          accountMerkleTreeNode: true
        }
      });
      const nonce = result.accountMerkleTreeNode? result.accountMerkleTreeNode.accountLeafNode.nonce.toString(): '0';
      return {
        L1Address: L1Address.check(result.L1Address),
        accountId: accountId.check(BigInt(result.accountId.toString())),
        email: Email.check(result.email),
        password: HashedPassword.check(result.password),
        role: Role.check(result.role),
        nonce: Nonce.check(BigInt(nonce))    
      };
    } catch (reason: unknown) {
      this.logger.error(reason);
      throw new UserNotFoundException();
    }
  }
  findAll(): Observable<AccountInfoWithoutPassword[]> {
    return from(this.accountInformationRepository.find()).pipe(
      map((accountInfos: AccountInformation[]) => {
        return accountInfos.map((accountInfo) => ({
          L1Address: L1Address.check(accountInfo.L1Address),
          accountId: accountId.check(accountInfo.accountId),
          email: Email.check(accountInfo.email),
          role: Role.check(accountInfo.role)
        }));
      })
    );
  }
  async findByEmail(email: Email): Promise<AccountInfo> {
    try {
      const result = await this.accountInformationRepository.findOne({
        where: {
          email: email
        }
      });
      if (result == null) {
        throw new UserNotFoundException();
      }
      return {
        L1Address: L1Address.check(result.L1Address),
        accountId: accountId.check(BigInt(result.accountId.toString())),
        email: Email.check(result.email),
        password: HashedPassword.check(result.password),
        role: Role.check(result.role)    
      };
    } catch (reason: unknown) {
      throw new UserNotFoundException();
    }
  }
  async signIn(refreshToken: RefreshToken, L1Address: L1Address) {
    try {
      await this.accountInformationRepository.update(
        { L1Address: L1Address},
        { refreshToken: refreshToken, updatedBy: 'Server' }
      ); 
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }
  async signOut(L1Address: L1Address) {
    try {
      await this.accountInformationRepository.update(
        { L1Address: L1Address},
        { refreshToken : null, updatedBy: 'Server' }
      );
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }
}