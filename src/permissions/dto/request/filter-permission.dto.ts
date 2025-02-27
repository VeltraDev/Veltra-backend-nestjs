import { Transform } from 'class-transformer';
import {
  IsOptional,
  IsInt,
  Min,
  IsString,
  IsIn,
  IsDateString,
} from 'class-validator';
import { ErrorMessages } from 'src/exception/error-messages.enum';

export class FilterPermissionsDto {
  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value, 10))
  @Min(1, { message: ErrorMessages.PAGE_NUMBER_MIN.message })
  page?: number;

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value, 10))
  @Min(1, { message: ErrorMessages.LIMIT_RECORDS_MIN.message })
  limit?: number;

  @IsOptional()
  @IsString({ message: ErrorMessages.SORT_BY_STRING.message })
  @IsIn(['name', 'apiPath', 'method', 'module', 'createdAt'], {
    message: ErrorMessages.SORT_BY_INVALID.message,
  })
  sortBy?: string;

  @IsOptional()
  @IsString({ message: ErrorMessages.ORDER_STRING.message })
  @IsIn(['ASC', 'DESC', 'asc', 'desc'], {
    message: ErrorMessages.ORDER_INVALID.message,
  })
  order?: string;

  @IsOptional()
  @IsString({ message: ErrorMessages.PERMISSION_NAME_STRING.message })
  name?: string;

  @IsOptional()
  @IsString({ message: ErrorMessages.PERMISSION_API_PATH_STRING.message })
  apiPath?: string;

  @IsOptional()
  @IsString({ message: ErrorMessages.PERMISSION_METHOD_STRING.message })
  method?: string;

  @IsOptional()
  @IsString({ message: ErrorMessages.PERMISSION_MODULE_STRING.message })
  module?: string;

  @IsOptional()
  @IsDateString({}, { message: ErrorMessages.INVALID_DATE.message })
  createdAt?: string;
}
