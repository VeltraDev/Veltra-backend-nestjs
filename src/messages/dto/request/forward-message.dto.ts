import { IsUUID, IsNotEmpty } from 'class-validator';

export class ForwardMessageDto {
  @IsUUID()
  @IsNotEmpty()
  originalMessageId: string;

  @IsUUID()
  @IsNotEmpty()
  targetConversationId: string;
}
