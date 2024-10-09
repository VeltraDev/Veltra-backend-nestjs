import { Transform } from 'class-transformer';
import {
  IsOptional,
  IsInt,
  Min,
  IsString,
  IsIn,
  IsDateString,
  IsBoolean,
} from 'class-validator';
import { ErrorMessages } from 'src/exception/error-messages.enum';

export class GetRolesDto {
  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value, 10))
  @Min(1, { message: ErrorMessages.PAGE_NUMBER_MIN })
  page?: number;

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value, 10))
  @Min(1, { message: ErrorMessages.LIMIT_RECORDS_MIN })
  limit?: number;

  @IsOptional()
  @IsString({ message: ErrorMessages.SORT_BY_STRING })
  @IsIn(['name', 'apiPath', 'method', 'module', 'createdAt'], {
    message: ErrorMessages.SORT_BY_INVALID,
  })
  sortBy?: string;

  @IsOptional()
  @IsString({ message: ErrorMessages.ORDER_STRING })
  @IsIn(['ASC', 'DESC', 'asc', 'desc'], {
    message: ErrorMessages.ORDER_INVALID,
  })
  order?: string;

  @IsOptional()
  @IsString({ message: ErrorMessages.ROLE_NAME_STRING })
  name?: string;

  @IsOptional()
  @IsString({ message: ErrorMessages.ROLE_DESCRIPTION_STRING })
  description?: string;

  @IsOptional()
  @IsBoolean({ message: ErrorMessages.ROLE_IS_ACTIVE_BOOLEAN })
  @Transform(({ value }) => value === 'true')
  isActive?: boolean;

  @IsOptional()
  @IsDateString({}, { message: ErrorMessages.INVALID_DATE })
  createdAt?: string;
}
