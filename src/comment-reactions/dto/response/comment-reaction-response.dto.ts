import { Expose, Type } from 'class-transformer';
import { UserSecureResponseDto } from 'src/users/dto/response/user-secure-response.dto';
import { ReactionTypeResponseDto } from 'src/reaction-types/dto/response/reaction-type-response.dto';
import { CommentResponseDto } from 'src/comments/dto/response/comment-response.dto';

export class CommentReactionResponseDto {
  @Expose()
  id: string;

  @Expose()
  @Type(() => UserSecureResponseDto)
  user: UserSecureResponseDto;

  @Expose()
  @Type(() => CommentResponseDto)
  comment: CommentResponseDto;

  @Expose()
  @Type(() => ReactionTypeResponseDto)
  reactionType: ReactionTypeResponseDto;
}
