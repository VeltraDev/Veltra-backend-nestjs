import { Expose, Type } from 'class-transformer';
import { CommentReactionResponseDto } from 'src/comment-reactions/dto/response/comment-reaction-response.dto';
import { UserSecureResponseDto } from 'src/users/dto/response/user-secure-response.dto';

export class CommentResponseDto {
  @Expose()
  id: string;

  @Expose()
  content: string;

  @Expose()
  @Type(() => UserSecureResponseDto)
  user: UserSecureResponseDto;

  @Expose()
  createdAt: Date;

  @Expose()
  @Type(() => CommentResponseDto)
  children: CommentResponseDto[];

  @Expose()
  @Type(() => CommentReactionResponseDto)
  commentReactions: CommentReactionResponseDto[];
}
