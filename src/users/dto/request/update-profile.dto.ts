import { IsOptional, IsString } from 'class-validator';
import { ErrorMessages } from 'src/exception/error-messages.enum';

export class UpdateProfileInformationDto {
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
}
