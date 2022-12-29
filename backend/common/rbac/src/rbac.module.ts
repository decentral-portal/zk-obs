import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountController } from './infrastructure/adapter/controllers/account.controller';
import { AccountGuard } from './infrastructure/adapter/guards/account.guard';
import { AuthGuard } from './infrastructure/adapter/guards/auth.guard';
import { RoleGuard } from './infrastructure/adapter/guards/role.guard';
import { AccountInfoService } from './infrastructure/adapter/services/accountInfo.service';
import { AuthService } from './infrastructure/adapter/services/authentication.service';
import { HashingService } from './infrastructure/adapter/services/hashing.service';
import { AccountInfoRepository } from './infrastructure/ports/accountInfo.repository';
import { AuthServiceInterface } from './infrastructure/ports/authentication.service';
import { HashingServiceInterface } from './infrastructure/ports/hashing.service';

@Module({
  imports: [
    ConfigModule,
    JwtModule.register({signOptions: { expiresIn: '15m' }}),
    TypeOrmModule
  ],
  controllers: [
    AccountController
  ],
  providers: [
    {
      provide: AuthServiceInterface,
      useClass: AuthService
    }, {
      provide: HashingServiceInterface,
      useClass: HashingService
    }, {
      provide: AccountInfoRepository,
      useClass: AccountInfoService
    },
    AccountGuard, AuthGuard, RoleGuard
  ],
  exports: [
    RoleGuard
  ]
})
export class RbacModule {}