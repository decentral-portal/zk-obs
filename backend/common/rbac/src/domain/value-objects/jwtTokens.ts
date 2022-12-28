import { RefreshToken } from '../value-objects/refreshToken';
import { AccessToken } from '../value-objects/accessToken';
import { Record, Static } from 'runtypes';
export const JwtTokens = Record({
  accessToken: AccessToken,
  refreshToken: RefreshToken
});

export type JwtTokens = Static<typeof JwtTokens>;