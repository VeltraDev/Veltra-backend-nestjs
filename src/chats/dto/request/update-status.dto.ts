import { IsString } from 'class-validator';
import { ErrorMessages } from 'src/exception/error-messages.enum';

export class UpdateStatusDto {
  @IsString({ message: ErrorMessages.DISPLAY_STATUS_STRING.message })
  status: string;
}
