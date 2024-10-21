import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { ErrorMessages } from 'src/exception/error-messages.enum';

export class RegisterUserDto {
  @IsNotEmpty({ message: ErrorMessages.EMAIL_REQUIRED.message })
  @IsEmail({}, { message: ErrorMessages.EMAIL_INVALID.message })
  email: string;

  @IsNotEmpty({ message: ErrorMessages.PASSWORD_REQUIRED.message })
  @IsString({ message: ErrorMessages.PASSWORD_STRING.message })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    {
      message: ErrorMessages.PASSWORD_RULES.message,
    },
  )
  password: string;

  @IsNotEmpty({ message: ErrorMessages.FIRST_NAME_STRING.message })
  @IsString({ message: ErrorMessages.FIRST_NAME_STRING.message })
  firstName: string;

  @IsNotEmpty({ message: ErrorMessages.LAST_NAME_STRING.message })
  @IsString({ message: ErrorMessages.LAST_NAME_STRING.message })
  lastName: string;
}
