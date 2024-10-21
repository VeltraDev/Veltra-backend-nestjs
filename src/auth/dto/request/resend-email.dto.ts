import { IsEmail, IsNotEmpty } from 'class-validator';
import { ErrorMessages } from 'src/exception/error-messages.enum';

export class ResendEmailDto {
  @IsEmail({}, { message: ErrorMessages.EMAIL_INVALID.message })
  @IsNotEmpty({ message: ErrorMessages.EMAIL_REQUIRED.message })
  email: string;
}
