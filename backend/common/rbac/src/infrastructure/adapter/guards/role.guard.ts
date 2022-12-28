import { CanActivate, ExecutionContext, forwardRef, Inject, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { L1Address } from '@common/rbac/domain/value-objects/l1address';
import { RoleEnum } from '@common/rbac/domain/value-objects/role';
import { AccountInfoRepository } from '@common/rbac/infrastructure/ports/accountInfo.repository';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @Inject(forwardRef(() => AccountInfoRepository))
    private accountInfoService: AccountInfoRepository,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // lookup from meta 
    const roles = this.reflector.get<RoleEnum[]>('roles', context.getHandler());
    if (!roles) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const L1Address: L1Address = request.L1Address;
    try {
      const result = await this.accountInfoService.findOneOrFail(L1Address);
      const hasRole = () => roles.findIndex((role) => role == result.role) > -1;
      return hasRole();
    } catch (error) {
      return false;
    }
  }
  
}