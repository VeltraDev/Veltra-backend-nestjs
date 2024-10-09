import { IsOptional, IsInt, Min, IsString, IsIn } from 'class-validator';
import { ErrorMessages } from 'src/exception/error-messages.enum';

export class GetUsersDto {
  @IsOptional()
  @IsInt()
  @Min(1, { message: ErrorMessages.PAGE_NUMBER_MIN })
  page?: number;

  @IsOptional()
  @IsInt()
  @Min(1, { message: ErrorMessages.PAGE_NUMBER_MIN })
  limit?: number;

  @IsOptional()
  @IsString({ message: ErrorMessages.SORT_BY_STRING })
  @IsIn(['createdAt', 'email', 'firstName', 'lastName', 'phone'], {
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
  @IsString({ message: ErrorMessages.SEARCH_STRING })
  search?: string;

  @IsOptional()
  @IsString({ message: ErrorMessages.EMAIL_INVALID })
  email?: string;

  @IsOptional()
  @IsString({ message: ErrorMessages.FIRST_NAME_STRING })
  firstName?: string;

  @IsOptional()
  @IsString({ message: ErrorMessages.LAST_NAME_STRING })
  lastName?: string;

  @IsOptional()
  @IsString({ message: ErrorMessages.PHONE_NUMBER_VN_INVALID })
  phone?: string;
}
