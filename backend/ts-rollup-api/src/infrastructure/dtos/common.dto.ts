import { ApiProperty } from '@nestjs/swagger';


export class PaginationDto {
  @ApiProperty()
  pageNumber!: number;
  @ApiProperty()
  perPage!: number;
}

export abstract class PaginationResponse<T> {
  list!: T[];
  total!: number;
  perPage!: number;
  pageNumber!: number;
  totalPage!: number;
}
