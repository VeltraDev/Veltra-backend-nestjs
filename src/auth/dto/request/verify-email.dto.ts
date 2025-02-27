import { IsNotEmpty, IsString } from 'class-validator';
import { ErrorMessages } from 'src/exception/error-messages.enum';

export class VerifyEmailDto {
  @IsNotEmpty({ message: ErrorMessages.VERIFY_EMAIL_TOKEN_REQUIRED.message })
  @IsString({ message: ErrorMessages.VERIFY_EMAIL_TOKEN_STRING.message })
  token: string;
}
