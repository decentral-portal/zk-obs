import { ApiProperty } from '@nestjs/swagger';

export class RegisterRequestDto {
  @ApiProperty()
  reqType!: string;
  @ApiProperty()
  tokenId!: string;
  @ApiProperty()
  stateAmt!: string;
  @ApiProperty()
  nonce!: string;
  @ApiProperty()
  sender!: string;
  @ApiProperty()
  tsAddr!: string;
}