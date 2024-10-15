import { IsOptional, IsUUID } from 'class-validator';
import { ErrorMessages } from 'src/exception/error-messages.enum';

export class CreateOpenConversationDto {
  @IsUUID('4', { message: ErrorMessages.RECEIVERID_NOT_UUID_4 })
  receiveId: string;
}
