import { ApiProperty } from '@nestjs/swagger';

export class PlaceOrderResponseDto {
  @ApiProperty()
  orderId!: string;
}