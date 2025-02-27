import { IsNotEmpty, IsUUID } from 'class-validator';
import { ErrorMessages } from 'src/exception/error-messages.enum';

export class CreateCommentReactionDto {
  @IsNotEmpty({ message: ErrorMessages.REACTION_TYPE_ID_REQUIRED.message })
  @IsUUID('4', { message: ErrorMessages.REACTION_TYPE_ID_INVALID.message })
  reactionTypeId: string;
}
