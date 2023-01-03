import { ApiProperty } from '@nestjs/swagger';

export class TokenBalanceInfoDto {
  @ApiProperty()
  L2TokenAddr!: string;
  @ApiProperty()
  availableAmt!: string;
  @ApiProperty()
  lockedAmt!: string;
}
export class GetL2BalanceResponseDto {
  @ApiProperty({
    isArray: true,
    type: TokenBalanceInfoDto,
  })
  list!: TokenBalanceInfoDto[];
}