import { PartialType } from '@nestjs/swagger';
import { CreateUserConversationDto } from './create-user-conversation.dto';

export class UpdateUserConversationDto extends PartialType(CreateUserConversationDto) {}
