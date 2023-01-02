import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class GetAvailableRequestDto {
  @ApiPropertyOptional({
    isArray: true,
    type: [String]
  })
  L2TokenAddrs!: string[]
  @ApiPropertyOptional()
  L1Address!: string;
  @ApiPropertyOptional()
  accountId!: string;
}

export class TokenInfo {
  @ApiProperty()
  tokenAddr!: string;
  @ApiProperty()
  amount!: string;
  @ApiProperty()
  lockAmt!: string;
}
export class GetAvailableResponseDto {
  @ApiProperty({
    // name: 'list',
    isArray: true,
    type: TokenInfo,
  })
  list!: TokenInfo[];
}
