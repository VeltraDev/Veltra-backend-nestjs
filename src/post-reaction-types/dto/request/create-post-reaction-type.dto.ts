import { IsNotEmpty, IsString } from 'class-validator';
import { ErrorMessages } from 'src/exception/error-messages.enum';

export class CreatePostReactionTypeDto {
  @IsNotEmpty({ message: ErrorMessages.REACTION_TYPE_REQUIRED.message })
  @IsString({ message: ErrorMessages.REACTION_TYPE_STRING.message })
  type: string;
}
