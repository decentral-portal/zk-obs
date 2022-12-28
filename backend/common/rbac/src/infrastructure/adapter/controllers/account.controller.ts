import { BadRequestException, Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ValidationError } from 'runtypes';
import { PinoLoggerService } from '@common/logger/adapters/real/pinoLogger.service';
import { AuthGuard } from '@common/rbac/infrastructure/adapter/guards/auth.guard';
import { RoleGuard } from '@common/rbac/infrastructure/adapter/guards/role.guard';
import { hasRoles } from '@common/rbac/infrastructure/adapter/decorators/roles.decorator';
import { SignInRequestDto, SignInResponseDto } from '@common/rbac/infrastructure/adapter/dtos/signIn.dto';
import { SignOutRequestDto, SignOutResponseDto } from '@common/rbac/infrastructure/adapter/dtos/signout.dto';
import { SignUpRequestDto, SignUpResponseDto } from '@common/rbac/infrastructure/adapter/dtos/signUp.dto';
import { L2Address } from '@common/rbac/domain/value-objects/l2address';
import { Email } from '@common/rbac/domain/value-objects/email';
import { HashedPassword } from '@common/rbac/domain/value-objects/password';
import { Role, RoleEnum } from '@common/rbac/domain/value-objects/role';
import { formatL1Address, L1Address } from '@common/rbac/domain/value-objects/l1address';
import { IncorrectPasswordException } from '@common/rbac/domain/exceptions/incorrectPassword.exception';
import { L1AddressAlreadyExistsException } from '@common/rbac/domain/exceptions/L1AddressAlreadyExists.exception';
import { AccountInfoRepository } from '@common/rbac/infrastructure/ports/accountInfo.repository';
import { HashingServiceInterface } from '@common/rbac/infrastructure/ports/hashing.service';
import { AuthServiceInterface } from '@common/rbac/infrastructure/ports/authentication.service';

@Controller('/v1/account')
export class AccountController {
  constructor(
    private readonly logger: PinoLoggerService,
    private readonly authService: AuthServiceInterface,
    private readonly accountService: AccountInfoRepository,
    private readonly hashingService: HashingServiceInterface,
  ) {
    this.logger.setContext('AccountController');
  }
  @Post('/signUp')
  async signUp(@Body() signUpDto: SignUpRequestDto): Promise<SignUpResponseDto> {
    try {
      const upperCaseL1Address = formatL1Address(signUpDto.L1Address);
      const [hashedPassword, currentAccountCount] = await Promise.all([ 
        this.hashingService.hashPlainPassword(HashedPassword.check(signUpDto.password)),
        this.accountService.getAccountInfoCount()
      ]);
      const l2Address = 1n + BigInt(currentAccountCount.toString());
      const accountInfo = await this.accountService.createAccount(
        {
          email: Email.check(signUpDto.email),
          password: hashedPassword,
          L1Address: L1Address.check(upperCaseL1Address),
          L2Address: L2Address.check(l2Address),
          role: Role.check(RoleEnum.MEMBER)  
        }
      );
      return {
        message: `account for email: ${accountInfo.email} create successfully`
      }
    } catch (error: any) {
      if (error instanceof ValidationError) {
        console.log(error);
        throw new BadRequestException('Invalid Input');
      }
      if((Object.hasOwnProperty.call(error, 'code') && error.code === '23505')) {
        throw new L1AddressAlreadyExistsException(`Account already exists, please use another L1Address or email`);
      }
      throw error;
    }
  }
  @Post('/signIn')
  async signIn(@Body() signInDto: SignInRequestDto): Promise<SignInResponseDto> {
    try {
      const accountInfo = await this.accountService.findByEmail(Email.check(signInDto.email));
      const isPasswordMatch = await this.hashingService.checkSamePassword(
        HashedPassword.check(signInDto.password),
        HashedPassword.check(accountInfo.password)
      );
      if (!isPasswordMatch) {
        throw new IncorrectPasswordException();
      }
      const {refreshToken, accessToken }= await this.authService.createAuthenticationTokens(accountInfo.L1Address);
      await this.accountService.signIn(refreshToken, accountInfo.L1Address);
      return {
        refresh_token: refreshToken.toString(),
        access_token: accessToken.toString()
      };
    } catch (error: any) {
      if (error instanceof ValidationError) {
        throw new BadRequestException('Invalid Input');
      }
      throw error;
    }
  }
  @Post('/signOut')
  @UseGuards(AuthGuard)
  async signOut(@Body() signoutDto: SignOutRequestDto): Promise<SignOutResponseDto> {
    try {
      const accountInfo = await this.accountService.findByEmail(Email.check(signoutDto.email));
      await this.accountService.signOut(accountInfo.L1Address);
      return {
        message: `${accountInfo.email} has been successfully signout`
      };
    } catch (error: any) {
      if (error instanceof ValidationError) {
        throw new BadRequestException('Invalid Input');
      }
      throw error;
    }
  }
  @Post('/change')
  @hasRoles(RoleEnum.ADMIN, RoleEnum.OPERATOR)
  @UseGuards(AuthGuard, RoleGuard)
  async changeRole() {
    this.logger.log('test change');
  }
}