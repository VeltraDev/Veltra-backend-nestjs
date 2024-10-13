import { Transform } from 'class-transformer';
import {
  IsOptional,
  IsInt,
  Min,
  IsString,
  IsIn,
  IsDateString,
  IsEmail,
} from 'class-validator';
import { ErrorMessages } from 'src/exception/error-messages.enum';

export class FilterUsersDto {
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
  @IsIn(
    ['createdAt', 'email', 'firstName', 'lastName', 'phone', 'displayStatus'],
    {
      message: ErrorMessages.SORT_BY_INVALID,
    },
  )
  sortBy?: string;

  @IsOptional()
  @IsString({ message: ErrorMessages.ORDER_STRING })
  @IsIn(['ASC', 'DESC', 'asc', 'desc'], {
    message: ErrorMessages.ORDER_INVALID,
  })
  order?: string;

  @IsOptional()
  @IsString({ message: ErrorMessages.FIRST_NAME_STRING })
  firstName?: string;

  @IsOptional()
  @IsString({ message: ErrorMessages.LAST_NAME_STRING })
  lastName?: string;

  @IsOptional()
  @IsEmail({}, { message: ErrorMessages.EMAIL_INVALID })
  email?: string;

  @IsOptional()
  @IsDateString({}, { message: ErrorMessages.INVALID_DATE })
  createdAt?: string;

  @IsOptional()
  @IsString({ message: ErrorMessages.DISPLAY_STATUS_STRING })
  displayStatus?: string;
}
