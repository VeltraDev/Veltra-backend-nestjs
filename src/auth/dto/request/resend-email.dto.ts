import { IsEmail, IsNotEmpty } from 'class-validator';
import { ErrorMessages } from 'src/exception/error-messages.enum';

export class ResendEmailDto {
  @IsEmail({}, { message: ErrorMessages.EMAIL_INVALID })
  @IsNotEmpty({ message: ErrorMessages.EMAIL_REQUIRED })
  email: string;
}
