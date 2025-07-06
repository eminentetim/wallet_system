
import { Type } from 'class-transformer';
import { IsOptional, IsInt, Min } from 'class-validator';

export class PaginateQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit = 20;
}
