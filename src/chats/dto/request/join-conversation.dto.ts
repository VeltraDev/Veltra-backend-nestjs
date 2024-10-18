import { IsUUID } from 'class-validator';
import { ErrorMessages } from 'src/exception/error-messages.enum';

export class JoinConversationDto {
  @IsUUID('4', {
    message: ErrorMessages.CONVERSATION_USER_IDS_UUID,
  })
  conversationId: string;
}
