import { IsArray, IsUUID, ArrayNotEmpty } from 'class-validator';
import { ErrorMessages } from 'src/exception/error-messages.enum';

export class AddUsersDto {
  @IsArray({ message: ErrorMessages.CONVERSATION_USER_IDS_ARRAY })
  @ArrayNotEmpty({ message: ErrorMessages.CONVERSATION_USER_IDS_NOT_EMPTY })
  @IsUUID('4', {
    each: true,
    message: ErrorMessages.CONVERSATION_USER_IDS_UUID,
  })
  userIds: string[];
}
