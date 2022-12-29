import { ConflictException } from '@nestjs/common';

export class L1AddressAlreadyExistsException extends ConflictException {
  constructor(message: string) {
    super(message);
  }
}
