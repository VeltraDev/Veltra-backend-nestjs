import { Expose, Type } from 'class-transformer';
import { UserSecureResponseDto } from 'src/users/dto/response/user-secure-response.dto';
import { CommentReactionResponseDto } from 'src/comment-reactions/dto/response/comment-reaction-response.dto';

export class CommentResponseDto {
  @Expose()
  id: string;

  @Expose()
  content: string;

  @Expose()
  @Type(() => UserSecureResponseDto)
  author: UserSecureResponseDto;

  @Expose()
  createdAt: Date;

  @Expose()
  @Type(() => CommentReactionResponseDto)
  reactions: CommentReactionResponseDto[];

  @Expose()
  @Type(() => CommentResponseDto)
  children: CommentResponseDto[];
}
