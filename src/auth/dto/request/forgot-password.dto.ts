import { IsEmail, IsNotEmpty } from 'class-validator';
import { ErrorMessages } from 'src/exception/error-messages.enum';

export class ForgotPasswordDto {
  @IsNotEmpty({ message: ErrorMessages.EMAIL_REQUIRED })
  @IsEmail({}, { message: ErrorMessages.EMAIL_INVALID })
  email: string;
}
