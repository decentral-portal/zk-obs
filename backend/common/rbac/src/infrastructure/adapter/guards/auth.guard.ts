import { PinoLoggerService } from '@common/logger/adapters/real/pinoLogger.service';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { L1Address } from '@common/rbac/domain/value-objects/l1address';
import { AuthServiceInterface } from '../../ports/authentication.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly logger: PinoLoggerService,
    private readonly authService: AuthServiceInterface
  ) {
    this.logger.setContext('AuthGuard');
  }
  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request = context.switchToHttp().getRequest();
      const authorizationHeader = this.authService.extractAuthorizationHeaderFromRequest(request);
      const accessToken = this.authService.extractBearerTokenFromAuthorizationHeader(authorizationHeader);
      const decoded = this.authService.verifyAccessToken(accessToken);
      const l1Address: L1Address = L1Address.check(decoded.l1address);
      request['L1Address'] = L1Address;  
      return true;
    } catch(error) {
      this.logger.error(error);
      throw error;
    }
  }

}