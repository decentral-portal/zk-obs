import { HashedPassword } from '@common/rbac/domain/value-objects/password';

export abstract class HashingServiceInterface {
  hashPlainPassword!: (plainPassword: HashedPassword) => Promise<HashedPassword>;
  checkSamePassword!: (plainPassword: HashedPassword, 
    hashedPassword: HashedPassword) => Promise<boolean>;
}