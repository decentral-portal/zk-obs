import { ApiProperty } from '@nestjs/swagger';

export class UpdateAccountTreeDto {
  @ApiProperty()
  leafId!: string;
  @ApiProperty()
  tsAddr!: string;
  @ApiProperty()
  nonce!: string;
  @ApiProperty()
  tokenRoot!: string;
}