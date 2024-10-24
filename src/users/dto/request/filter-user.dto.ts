import { Transform } from 'class-transformer';
import {
  IsOptional,
  IsInt,
  Min,
  IsString,
  IsIn,
  IsDateString,
  IsEmail,
  IsUUID,
} from 'class-validator';
import { ErrorMessages } from 'src/exception/error-messages.enum';

export class FilterUsersDto {
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
  @IsIn(
    ['createdAt', 'email', 'firstName', 'lastName', 'phone', 'displayStatus'],
    {
      message: ErrorMessages.SORT_BY_INVALID.message,
    },
  )
  sortBy?: string;

  @IsOptional()
  @IsString({ message: ErrorMessages.ORDER_STRING.message })
  @IsIn(['ASC', 'DESC', 'asc', 'desc'], {
    message: ErrorMessages.ORDER_INVALID.message,
  })
  order?: string;

  @IsOptional()
  @IsString({ message: ErrorMessages.FIRST_NAME_STRING.message })
  firstName?: string;

  @IsOptional()
  @IsString({ message: ErrorMessages.LAST_NAME_STRING.message })
  lastName?: string;

  @IsOptional()
  @IsEmail({}, { message: ErrorMessages.EMAIL_INVALID.message })
  email?: string;

  @IsOptional()
  @IsDateString({}, { message: ErrorMessages.INVALID_DATE.message })
  createdAt?: string;

  @IsOptional()
  @IsString({ message: ErrorMessages.DISPLAY_STATUS_STRING.message })
  displayStatus?: string;
}
