import { TsTokenAddress } from '@common/ts-typeorm/account/dto/ts-type';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GetL2BalanceRequestDto {
  @ApiProperty()
  accountId!: string;
  @ApiPropertyOptional({
    isArray: true,
    type: [TsTokenAddress],
  })
  L2TokenAddrList?: TsTokenAddress[];
}