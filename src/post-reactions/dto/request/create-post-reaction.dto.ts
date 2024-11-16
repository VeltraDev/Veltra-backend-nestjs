import { IsNotEmpty, IsUUID } from 'class-validator';
import { ErrorMessages } from 'src/exception/error-messages.enum';

export class CreatePostReactionDto {
  @IsNotEmpty({ message: ErrorMessages.REACTION_TYPE_ID_REQUIRED.message })
  @IsUUID('4', { message: ErrorMessages.POST_REACTION_UUID.message })
  reactionTypeId: string;
}
