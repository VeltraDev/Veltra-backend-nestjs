import { IsOptional, IsString } from 'class-validator';
import { ErrorMessages } from 'src/exception/error-messages.enum';

export class UpdateProfileInformationDto {
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
}
