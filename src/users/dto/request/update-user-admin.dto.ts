import {
  IsOptional,
  IsString,
  IsBoolean,
  IsUUID,
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
  @IsString({ message: ErrorMessages.DISPLAY_STATUS_STRING })
  displayStatus?: string;

  @IsOptional()
  @IsBoolean({ message: ErrorMessages.IS_VERIFIED_BOOLEAN })
  isVerified?: boolean;

  @IsOptional()
  @IsUUID('4', { message: ErrorMessages.ROLEID_NOT_UUID_4 })
  roleId?: string;
}
