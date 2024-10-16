import { IsArray, ArrayMinSize, IsUUID } from 'class-validator';
import { ErrorMessages } from 'src/exception/error-messages.enum';

export class CreateConversationDto {
  @IsArray({ message: ErrorMessages.CONVERSATION_USERS_ARRAY })
  @ArrayMinSize(1, { message: ErrorMessages.CONVERSATION_USERS_MIN_SIZE })
  @IsUUID('all', { each: true, message: ErrorMessages.CONVERSATION_USERS_UUID })
  users: string[];
}
