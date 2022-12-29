import { PinoLoggerService } from '@common/logger/adapters/real/pinoLogger.service';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { HashedPassword } from '@common/rbac/domain/value-objects/password';
import { HashingServiceInterface } from '@common/rbac/infrastructure/ports/hashing.service';
const saltOrRounds = 10;
@Injectable()
export class HashingService implements HashingServiceInterface {
  constructor(private readonly logger: PinoLoggerService) {
    this.logger.setContext('HashingService');
  }
  async hashPlainPassword(plainPassword: HashedPassword) {
    try {
      const hash = await bcrypt.hash(plainPassword, saltOrRounds);
      return HashedPassword.check(hash);
    } catch(reason: unknown) {
      throw new InternalServerErrorException();
    }
  }
  async checkSamePassword(
    plainPassword: HashedPassword,
    hashedPassword: HashedPassword
  ) {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (reason: unknown) {
      throw new InternalServerErrorException();
    }
  }
}