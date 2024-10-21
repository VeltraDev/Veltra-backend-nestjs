import { IsEmail, IsNotEmpty } from 'class-validator';
import { ErrorMessages } from 'src/exception/error-messages.enum';

export class ForgotPasswordDto {
  @IsNotEmpty({ message: ErrorMessages.EMAIL_REQUIRED.message })
  @IsEmail({}, { message: ErrorMessages.EMAIL_INVALID.message })
  email: string;
}
