
import { SetMetadata } from '@nestjs/common';
import { RoleEnum } from '@common/rbac/domain/value-objects/role';

export const hasRoles = (...hasRoles: RoleEnum[]) => SetMetadata('roles', hasRoles);