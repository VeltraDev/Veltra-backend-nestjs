import { IsOptional, IsString } from 'class-validator';
import { ErrorMessages } from 'src/exception/error-messages.enum';

export class UpdateInfoConversationDto {
  @IsOptional()
  @IsString({ message: ErrorMessages.CONVERSATION_NAME_STRING.message })
  name?: string;

  @IsOptional()
  @IsString({ message: ErrorMessages.CONVERSATION_PICTURE_STRING.message })
  picture?: string;
}
