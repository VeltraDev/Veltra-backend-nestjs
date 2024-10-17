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

export class FilterConversationsDto {
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
  @IsIn(['name', 'createdAt'], {
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
  @IsString({ message: ErrorMessages.CONVERSATION_NAME_STRING })
  name?: string;

  @IsOptional()
  @IsDateString({}, { message: ErrorMessages.INVALID_DATE })
  createdAt?: string;
}
