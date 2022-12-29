import { TsTokenAddress } from '@ts-sdk/domain/lib/ts-types/ts-types';

export class L2AccountInfo {
  L2Address!: bigint;
  L2TokenAddr!: TsTokenAddress;
}

export class L2AccountInfoResponse {
  availableAmount!: bigint;
  L2TokenAddr!: TsTokenAddress;
}

export const toTsTokenAddress = (value: number): TsTokenAddress => {
  const token = Object.values(TsTokenAddress).find((token) => token.toString() == value.toString());
  return token ? token : TsTokenAddress.Unknown;
};

export const toTsTokenAddressFromStr = (value: string): TsTokenAddress => {
  const token = Object.values(TsTokenAddress).find((token) => token.toString() == value);
  return token ? token : TsTokenAddress.Unknown;
}