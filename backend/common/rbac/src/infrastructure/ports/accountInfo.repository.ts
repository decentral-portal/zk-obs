import { Observable } from 'rxjs';
import { L1Address } from '@common/rbac/domain/value-objects/l1address';
import { AccountInfo, AccountInfoWithoutPassword, AccountNonceInfo } from '@common/rbac/domain/entities/accountInfo';
import { Email } from '@common/rbac/domain/value-objects/email';
import { RefreshToken } from '@common/rbac/domain/value-objects/refreshToken';
export abstract class AccountInfoRepository {
  createAccount!: (accountInfo: AccountInfo) => Promise<AccountInfo>;
  findOneOrFail!: (l1Address: L1Address) => Promise<AccountNonceInfo>;
  findAll!: () => Observable<AccountInfoWithoutPassword[]>;
  findByEmail!: (email: Email) => Promise<AccountInfo>;
  signIn!: (refreshToken: RefreshToken, l1address: L1Address) => Promise<void>;
  signOut!: (l1Address: L1Address) => Promise<void>;
  getAccountInfoCount!: () => Promise<number>;
} 