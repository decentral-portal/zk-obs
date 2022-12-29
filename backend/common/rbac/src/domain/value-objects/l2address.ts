import { Static, BigInt } from 'runtypes';
export const L2Address = BigInt.withBrand('L2Address');
export type L2Address = Static<typeof L2Address>;