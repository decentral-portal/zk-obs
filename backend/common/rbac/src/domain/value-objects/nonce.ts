import { Static, BigInt } from 'runtypes';
export const Nonce = BigInt.withBrand('Nonce');
export type Nonce = Static<typeof Nonce>;