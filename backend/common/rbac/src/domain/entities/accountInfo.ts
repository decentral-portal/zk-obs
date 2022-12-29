import { Record, Static } from 'runtypes';
import { L1Address } from '../value-objects/l1address';
import { AccountId } from '../value-objects/l2address';
import { HashedPassword } from '../value-objects/password';
import { Email } from '@common/rbac/domain/value-objects/email';
import { Role } from '../value-objects/role';
import { Nonce } from '../value-objects/nonce';
export const AccountInfo = Record({
  L1Address: L1Address,
  accountId: AccountId,
  password: HashedPassword,
  email: Email,
  role: Role
});
export const AccountNonceInfo = Record({
  L1Address: L1Address,
  accountId: AccountId,
  password: HashedPassword,
  email: Email,
  role: Role,
  nonce: Nonce
});
export const AccountInfoWithoutPassword = Record({
  L1Address: L1Address,
  accountId: AccountId,
  email: Email,
  role: Role,
}); 
export type AccountInfo = Static<typeof AccountInfo>;
export type AccountNonceInfo = Static<typeof AccountNonceInfo>;
export type AccountInfoWithoutPassword = Static<typeof AccountInfoWithoutPassword>;