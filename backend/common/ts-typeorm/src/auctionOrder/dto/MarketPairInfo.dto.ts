import { ApiProperty } from "@nestjs/swagger";

export class MarketPairInfoResponseDto {
  @ApiProperty()
  mainTokenId!: string;
  @ApiProperty()
  baseTokenId!: string;
  @ApiProperty()
  marketPair!: string;
}
export class MarketPair {
  @ApiProperty()
  mainTokenId!: string;
  @ApiProperty()
  baseTokenId!: string;
}
export class MarketPairInfoRequestDto {
  @ApiProperty()
  pairs!: MarketPair[];
}