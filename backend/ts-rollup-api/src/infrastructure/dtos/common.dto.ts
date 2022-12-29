import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TS_STATUS } from 'common/ts-typeorm/src/account/tsStatus.enum';


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
