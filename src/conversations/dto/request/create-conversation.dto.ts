import { IsArray, ArrayMinSize, IsUUID, IsOptional, IsString } from 'class-validator';
import { ErrorMessages } from 'src/exception/error-messages.enum';

export class CreateConversationDto {
  @IsArray({ message: ErrorMessages.CONVERSATION_USERS_ARRAY.message })
  @ArrayMinSize(1, {
    message: ErrorMessages.CONVERSATION_USERS_MIN_SIZE.message,
  })
  @IsUUID('4', {
    each: true,
    message: ErrorMessages.CONVERSATION_USERS_UUID.message,
  })
  users: string[];

  @IsOptional()
  @IsString({ message: ErrorMessages.CONVERSATION_NAME_STRING.message })
  name?: string;

  @IsOptional()
  @IsString({ message: ErrorMessages.CONVERSATION_PICTURE_STRING.message })
  picture?: string;
}