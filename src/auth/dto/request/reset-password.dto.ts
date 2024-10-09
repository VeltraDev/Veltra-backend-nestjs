import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { ErrorMessages } from 'src/exception/error-messages.enum';

export class ResetPasswordDto {
  @IsNotEmpty({ message: ErrorMessages.PASSWORD_REQUIRED })
  @IsString({ message: ErrorMessages.PASSWORD_STRING })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    {
      message: ErrorMessages.PASSWORD_RULES,
    },
  )
  newPassword: string;

  @IsNotEmpty({ message: ErrorMessages.CONFIRM_PASSWORD_REQUIRED })
  @IsString({ message: ErrorMessages.CONFIRM_PASSWORD_STRING })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    {
      message: ErrorMessages.CONFIRM_PASSWORD_MATCH,
    },
  )
  confirmPassword: string;

  @IsNotEmpty({ message: ErrorMessages.TOKEN_REQUIRED })
  @IsString({ message: ErrorMessages.TOKEN_STRING })
  token: string;
}
