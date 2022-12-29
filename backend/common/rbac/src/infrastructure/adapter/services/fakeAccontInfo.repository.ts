import { AccountInfo, AccountInfoWithoutPassword, AccountNonceInfo } from '@common/rbac/domain/entities/accountInfo';
import { UserNotFoundException } from '@common/rbac/domain/exceptions/userNotFound.exception';
import { Email } from '@common/rbac/domain/value-objects/email';
import { L1Address } from '@common/rbac/domain/value-objects/l1address';
import { L2Address } from '@common/rbac/domain/value-objects/l2address';
import { Nonce } from '@common/rbac/domain/value-objects/nonce';
import { HashedPassword } from '@common/rbac/domain/value-objects/password';
import { RefreshToken } from '@common/rbac/domain/value-objects/refreshToken';
import { Role, RoleEnum } from '@common/rbac/domain/value-objects/role';
import { AccountInfoRepository } from '@common/rbac/infrastructure/ports/accountInfo.repository';
import { from, Observable } from 'rxjs';
import { TypeORMError } from 'typeorm';

export class FakeAccountInfoRepository implements AccountInfoRepository {
  private currentNonce = 0n;
  private accountInfos: AccountNonceInfo[] = [{
    email: Email.check('yuanyu.liang@tkspring.com'),
    password: HashedPassword.check('$2b$10$uPKEP0XrlFezBHITfpNcRe1rDZJIhTdkFUOWN03x6jVpUNGB622jG'),
    L1Address: L1Address.check('319AbFF6695E87d5E402F803045AaD0F07b5dA7d'),
    L2Address: L2Address.check(101n),
    nonce: Nonce.check(0n),
    role: Role.check(RoleEnum.MEMBER),
  }];
  async createAccount(accountInfo: AccountInfo): Promise<AccountInfo> {
    const exists = this.accountInfos.find((account) => account.email == accountInfo.email || account.L1Address == accountInfo.L1Address);
    if (exists !== undefined) {
      // throw new L1AddressAlreadyExistsException(`Account already exists, please use another L1Address or email`);
      throw new TypeORMError(`Account already exists, please use another L1Address or email`); 
    }
    this.currentNonce++;
    this.accountInfos.push({...accountInfo, nonce: Nonce.check(this.currentNonce) } as AccountNonceInfo);
    return Promise.resolve(accountInfo);
  }
  async findOneOrFail(l1Address: L1Address): Promise<AccountNonceInfo> {
    const accountInfo = this.accountInfos.find((accountInfo) => accountInfo.L1Address == l1Address);
    if (!accountInfo) {
      throw new UserNotFoundException();
    }
    return accountInfo;
  }
  findAll(): Observable<AccountInfoWithoutPassword[]> {
    const accountInfos = this.accountInfos.map((accountInfo) => {
      const { password, nonce, ...accountInfoWithoutPassword } = accountInfo;
      return accountInfoWithoutPassword as AccountInfoWithoutPassword;
    })
    return from([accountInfos]);
  }
  async findByEmail(email: Email): Promise<AccountNonceInfo> {
    const accountInfo = this.accountInfos.find((accountInfo) => accountInfo.email == email);
    if (!accountInfo) {
      throw new UserNotFoundException();
    }
    return accountInfo;
  }
  async signIn(refeshToken: RefreshToken, l1Address: L1Address): Promise<void> {
    // console.log('signIn', refeshToken, l1Address);
  }
  async signOut(l1Address: L1Address): Promise<void> {
    // console.log('signOut', l1Address);
  }
  async getAccountInfoCount(): Promise<number> {
    return this.accountInfos.length;
  }
  
}