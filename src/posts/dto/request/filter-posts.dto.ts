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

export class FilterPostsDto {
  @IsOptional()
  @IsInt({ message: ErrorMessages.PAGE_NUMBER_MIN.message })
  @Transform(({ value }) => parseInt(value, 10))
  @Min(1, { message: ErrorMessages.PAGE_NUMBER_MIN.message })
  page?: number;

  @IsOptional()
  @IsInt({ message: ErrorMessages.LIMIT_RECORDS_MIN.message })
  @Transform(({ value }) => parseInt(value, 10))
  @Min(1, { message: ErrorMessages.LIMIT_RECORDS_MIN.message })
  limit?: number;

  @IsOptional()
  @IsString({ message: ErrorMessages.SORT_BY_STRING.message })
  @IsIn(['content', 'createdAt'], {
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
  @IsString({ message: ErrorMessages.POST_CONTENT_STRING.message })
  content?: string;

  @IsOptional()
  @IsDateString({}, { message: ErrorMessages.INVALID_DATE.message })
  createdAt?: string;
}
