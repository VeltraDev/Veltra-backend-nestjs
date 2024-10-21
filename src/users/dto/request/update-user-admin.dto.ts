import {
  IsOptional,
  IsString,
  IsBoolean,
  IsUUID,
} from 'class-validator';
import { ErrorMessages } from 'src/exception/error-messages.enum';

export class UpdateUserAdminDto {
  @IsOptional()
  @IsString({ message: ErrorMessages.FIRST_NAME_STRING.message })
  firstName?: string;

  @IsOptional()
  @IsString({ message: ErrorMessages.LAST_NAME_STRING.message })
  lastName?: string;

  @IsOptional()
  @IsString({ message: ErrorMessages.AVATAR_STRING.message })
  avatar?: string;

  @IsOptional()
  @IsString({ message: ErrorMessages.DISPLAY_STATUS_STRING.message })
  displayStatus?: string;

  @IsOptional()
  @IsBoolean({ message: ErrorMessages.IS_VERIFIED_BOOLEAN.message })
  isVerified?: boolean;

  @IsOptional()
  @IsUUID('4', { message: ErrorMessages.ROLEID_NOT_UUID_4.message })
  roleId?: string;
}
