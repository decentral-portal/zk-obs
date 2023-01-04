// import { TsTokenAddress } from '@common/ts-typeorm/account/dto/ts-type';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TsTokenAddress } from '@ts-sdk/domain/lib/ts-types/ts-types';

export class GetL2BalanceRequestDto {
  @ApiProperty()
  accountId!: string;
  @ApiPropertyOptional({
    isArray: true,
    type: [TsTokenAddress],
  })
  L2TokenAddrList?: TsTokenAddress[];
}