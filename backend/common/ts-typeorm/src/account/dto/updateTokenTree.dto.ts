import { ApiProperty } from "@nestjs/swagger";

export class UpdateTokenTreeDto {
  @ApiProperty()
  lockedAmt!: string;
  @ApiProperty()
  availableAmt!: string;
  @ApiProperty()
  leafId!: string;
  @ApiProperty()
  accountId!: string;
}