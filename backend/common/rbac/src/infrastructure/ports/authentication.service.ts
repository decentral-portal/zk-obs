import { JwtTokens } from '@common/rbac/domain/value-objects/jwtTokens';
import { L1Address } from '@common/rbac/domain/value-objects/l1address';
import { Request } from 'express';
export abstract class AuthServiceInterface {
  createAuthenticationTokens!: (L1Address: L1Address) => Promise<JwtTokens>;
  extractAuthorizationHeaderFromRequest!: (request: Request) => string;
  extractBearerTokenFromAuthorizationHeader!: (authorizationHeader: string) => string;
  verifyIntegrityAndAuthenticityOfAccessToken!: (accessToken: string) => any;
  verifyIntegrityAndAuthenticityOfRefreshToken!: (refreshToken: string) => any;
  verifyAccessToken!: (accessToken: string) => any;
  verifyRefreshToken!: (refreshToken: string) => any;
}