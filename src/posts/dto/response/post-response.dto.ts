import { Expose, Type } from 'class-transformer';
import { UserSecureResponseDto } from 'src/users/dto/response/user-secure-response.dto';
import { ReactionResponseDto } from 'src/post-reactions/dto/response/reaction-response.dto';
import { CommentResponseDto } from 'src/comments/dto/response/comment-response.dto';

export class AttachmentResponseDto {
  @Expose()
  url: string;

  @Expose()
  type?: string;
}

export class PostResponseDto {
  @Expose()
  id: string;

  @Expose()
  content: string;

  @Expose()
  @Type(() => AttachmentResponseDto)
  attachments: AttachmentResponseDto[];

  @Expose()
  @Type(() => UserSecureResponseDto)
  user: UserSecureResponseDto;

  @Expose()
  createdAt: Date;

  @Expose()
  @Type(() => ReactionResponseDto)
  postReactions: ReactionResponseDto[];

  // @Expose()
  // @Type(() => CommentResponseDto)
  // comments: CommentResponseDto[];
}
