import { IsString, Matches, IsNotEmpty } from 'class-validator';
import { ErrorMessages } from 'src/exception/error-messages.enum';

export class UpdateProfilePasswordDto {
  @IsNotEmpty({ message: ErrorMessages.PASSWORD_REQUIRED.message })
  @IsString({ message: ErrorMessages.PASSWORD_STRING.message })
  currentPassword: string;

  @IsNotEmpty({ message: ErrorMessages.PASSWORD_REQUIRED.message })
  @IsString({ message: ErrorMessages.PASSWORD_STRING.message })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    {
      message: ErrorMessages.PASSWORD_RULES.message,
    },
  )
  newPassword: string;

  @IsNotEmpty({ message: ErrorMessages.CONFIRM_PASSWORD_REQUIRED.message })
  @IsString({ message: ErrorMessages.CONFIRM_PASSWORD_STRING.message })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    {
      message: ErrorMessages.CONFIRM_PASSWORD_MATCH.message,
    },
  )
  confirmPassword: string;
}
