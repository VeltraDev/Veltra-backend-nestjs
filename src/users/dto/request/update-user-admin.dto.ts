import {
  IsOptional,
  IsString,
  IsBoolean,
  IsPhoneNumber,
} from 'class-validator';
import { ErrorMessages } from 'src/exception/error-messages.enum';

export class UpdateUserAdminDto {
  @IsOptional()
  @IsString({ message: ErrorMessages.FIRST_NAME_STRING })
  firstName?: string;

  @IsOptional()
  @IsString({ message: ErrorMessages.LAST_NAME_STRING })
  lastName?: string;

  @IsOptional()
  @IsString({ message: ErrorMessages.AVATAR_STRING })
  avatar?: string;

  @IsOptional()
  @IsPhoneNumber('VN', {
    message: ErrorMessages.PHONE_NUMBER_VN_INVALID,
  })
  phone?: string;

  @IsOptional()
  @IsString({ message: ErrorMessages.DISPLAY_STATUS_STRING })
  displayStatus?: string;

  @IsOptional()
  @IsBoolean({ message: ErrorMessages.IS_VERIFIED_BOOLEAN })
  isVerified?: boolean;
}
