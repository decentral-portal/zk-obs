import { Static, String } from 'runtypes';
export enum RoleEnum  {
  MEMBER = 'MEMBER',
  ADMIN = 'ADMIN',
  OPERATOR = 'OPERATOR'
}

export const Role = String.withBrand('Role')
  .withConstraint((role: string) => Object.keys(RoleEnum).includes(role) || 'Role should be Valid');
export type Role = Static<typeof Role>;