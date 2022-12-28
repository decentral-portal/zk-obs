import { CanActivate, ExecutionContext, forwardRef, Inject, Injectable } from '@nestjs/common';
import { L1Address } from '@common/rbac/domain/value-objects/l1address';
import { AccountInfoRepository } from '../../ports/accountInfo.repository';

@Injectable()
export class AccountGuard implements CanActivate {
  constructor(
    @Inject(forwardRef(() => AccountInfoRepository))
    private readonly accountInfoService: AccountInfoRepository
  ) {}
  // Authentication by check if db has l1address
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    // const params = request.params;
    const L1Address: L1Address = request.L1Address;
    try {
      await this.accountInfoService.findOneOrFail(L1Address);
      return true;
    } catch (error) {
      return false;
    }
  }
  
}