import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { PinoLoggerService } from '@common/logger/adapters/real/pinoLogger.service';
import { AccessToken } from '@common/rbac/domain/value-objects/accessToken';
import { L1Address } from '@common/rbac/domain/value-objects/l1address';
import { RefreshToken } from '@common/rbac/domain/value-objects/refreshToken';
import { JwtTokens } from '@common/rbac/domain/value-objects/jwtTokens';
import { JwtSetting } from '@common/rbac/domain/value-objects/jwtSetting';
import { InvalidTokenException } from '@common/rbac/domain/exceptions/invalidToken.exception';
import { AuthServiceInterface } from '@common/rbac/infrastructure/ports/authentication.service';
@Injectable()
export class AuthService implements AuthServiceInterface {
  private readonly accessTokenSecret?: string;
  private readonly refreshTokenSecret?: string;
  constructor(private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private logger: PinoLoggerService) {
    this.accessTokenSecret = this.configService.get<string>('ACCESS_TOKEN_SECRET');
    this.refreshTokenSecret = this.configService.get<string>('REFRESH_TOKEN_SECRET');
    this.logger.setContext('AuthenticationService');
  }
  async createAuthenticationTokens(l1address: L1Address):  Promise<JwtTokens> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { l1address: l1address}, {
          secret: this.accessTokenSecret,
          expiresIn: JwtSetting.accessTokenExpiredTime
        }),
      this.jwtService.signAsync(
        { l1address: l1address}, {
          secret: this.refreshTokenSecret,
          expiresIn: JwtSetting.refreshTokenExpiredTime
        })
    ]);
    return {
      accessToken: AccessToken.check(accessToken),
      refreshToken: RefreshToken.check(refreshToken)
    };
  }
  extractAuthorizationHeaderFromRequest = (request: Request) => {
    const authorizationHeader = request.headers['authorization'];
    this.logger.log(`Authorization Header is "${authorizationHeader}"`);
    if (!authorizationHeader) {
      this.logger.warn('No authorization header provided: returning 401');
      throw new UnauthorizedException('Not logged in');
    }
    return authorizationHeader;
  };
  extractBearerTokenFromAuthorizationHeader = (authorizationHeader: string) => {
    const bearerScheme = /^Bearer (?<token>[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*)$/;
    const bearerMatch = authorizationHeader?.match(bearerScheme);
    if (bearerMatch === null || bearerMatch.groups === undefined) {
      this.logger.warn('Bearer not matching: returning 401');
      throw new UnauthorizedException('Unknown scheme');
    }
    return bearerMatch.groups.token;
  };
  verifyIntegrityAndAuthenticityOfAccessToken = (accessToken: string) => {
    try {
      return this.verifyAccessToken(accessToken);
    } catch(error) {
      this.logger.warn('Authentication service dit not verify token: return 401');
      throw new UnauthorizedException('Invalid Token');
    }
  };
  verifyIntegrityAndAuthenticityOfRefreshToken = (refreshToken: string) => {
    try {
      const decodedRefreshToken = this.verifyRefreshToken(refreshToken);
      return decodedRefreshToken;
    } catch(error) {
      this.logger.warn('Token verification failed');
      throw new InvalidTokenException();
    }  
  }; 
  verifyAccessToken(accessToken: string) {
    try {
      const decodedToken = this.jwtService.verify(accessToken, {
        secret: this.accessTokenSecret
      }); 
      this.logger.debug(`Verification succeed: ${JSON.stringify(decodedToken)}`);
      return decodedToken;
    } catch (error: any) {
      if (error?.message.includes('jwt expired')) {
        throw new ForbiddenException('Token expired');
      }
      throw new Error(`Verification failed: ${error}`);
    }
  }
  verifyRefreshToken(refreshToken: string) {
    try {
      const decodedRefreshToken = this.jwtService.verify(refreshToken, {
        secret: this.refreshTokenSecret
      }); 
      this.logger.debug(`Verification succeed: ${JSON.stringify(decodedRefreshToken)}`);
      return (decodedRefreshToken as any)['l1address'] as string;
    } catch (error: any) {
      if (error?.message.includes('jwt expired')) {
        throw new ForbiddenException('Token expired');
      }  
      throw new Error(`Verification failed: ${error}`);
    }
  }  
}