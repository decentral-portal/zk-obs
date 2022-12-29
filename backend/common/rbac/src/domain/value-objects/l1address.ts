import { Static, String } from 'runtypes';

const prefixedl1AddressRegex = /^0x[a-fA-F0-9]{40}$/ as RegExp;
const l1AddressRegex = /^[a-fA-F0-9]{40}$/ as RegExp;
export const L1Address = String.withBrand('L1Address')
  .withConstraint((L1Address) => L1Address.length >= 40 || 'L1Address be a greather than 40 characters')
  .withConstraint((L1Address) => L1Address.length <= 42 || 'L1Address be a valid Uppercase ethereum address')
  // .withConstraint((L1Address) =>  prefixedl1AddressRegex.test(L1Address) || l1AddressRegex.test(L1Address) || 'L1Address be a valid Uppercase ethereum address')
export type L1Address = Static<typeof L1Address>;

export const formatL1Address = (l1Address: string): L1Address => {
  if (l1Address.startsWith('0x')) {
    return l1Address.slice(2).toLocaleUpperCase() as L1Address;
  }
  return l1Address.toUpperCase() as L1Address;
}