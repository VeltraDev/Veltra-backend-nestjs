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

export class FilterRolesDto {
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
  @IsString({ message: ErrorMessages.ROLE_NAME_STRING.message })
  name?: string;

  @IsOptional()
  @IsString({ message: ErrorMessages.ROLE_DESCRIPTION_STRING.message })
  description?: string;

  @IsOptional()
  @IsBoolean({ message: ErrorMessages.ROLE_IS_ACTIVE_BOOLEAN.message })
  @Transform(({ value }) => {
    if (value === 'true' || value === '1') {
      return true;
    }
    if (value === 'false' || value === '0') {
      return false;
    }
    return value;
  })
  isActive?: boolean;

  @IsOptional()
  @IsDateString({}, { message: ErrorMessages.INVALID_DATE.message })
  createdAt?: string;
}
