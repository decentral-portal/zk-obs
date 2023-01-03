import { ApiProperty } from '@nestjs/swagger';

export class UpdateObsStateTreeDto {
  @ApiProperty()
  accountId!: string;
  @ApiProperty()
  tokenId!: string;
  @ApiProperty()
  lockedAmt!: string;
  @ApiProperty()
  availableAmt!: string;
}