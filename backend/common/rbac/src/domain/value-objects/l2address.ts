import { Static, BigInt } from 'runtypes';
export const AccountId = BigInt.withBrand('accountId');
export type AccountId = Static<typeof AccountId>;