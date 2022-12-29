import { ApiProperty } from '@nestjs/swagger';

export class CancelOrderResponseDto {
  @ApiProperty()
  orderLeafId!: string;
}