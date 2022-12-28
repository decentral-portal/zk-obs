import { NotFoundException } from '@nestjs/common';
export class L2TokenNotFoundException extends NotFoundException {
  constructor() {
    super('L2Token not found');
  }
}