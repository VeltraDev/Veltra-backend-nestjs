import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Matches,
} from 'class-validator';
import { ErrorMessages } from 'src/exception/error-messages.enum';

export class RegisterUserDto {
  @IsNotEmpty({ message: ErrorMessages.EMAIL_REQUIRED })
  @IsEmail({}, { message: ErrorMessages.EMAIL_INVALID })
  email: string;

  @IsNotEmpty({ message: ErrorMessages.PASSWORD_REQUIRED })
  @IsString({ message: ErrorMessages.PASSWORD_STRING })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    {
      message: ErrorMessages.PASSWORD_RULES,
    },
  )
  password: string;

  @IsNotEmpty({ message: ErrorMessages.FIRST_NAME_STRING })
  @IsString({ message: ErrorMessages.FIRST_NAME_STRING })
  firstName: string;

  @IsNotEmpty({ message: ErrorMessages.LAST_NAME_STRING })
  @IsString({ message: ErrorMessages.LAST_NAME_STRING })
  lastName: string;

  @IsOptional()
  @IsString({ message: ErrorMessages.AVATAR_STRING })
  avatar?: string;

  @IsOptional()
  @IsPhoneNumber('VN', { message: ErrorMessages.PHONE_NUMBER_VN_INVALID })
  phone?: string;
}
