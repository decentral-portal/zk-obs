import { ApiProperty } from '@nestjs/swagger';

export class CancelOrderRequestDto {
  @ApiProperty()
  orderLeafId!: string;
  @ApiProperty()
  receiver!: string;
}