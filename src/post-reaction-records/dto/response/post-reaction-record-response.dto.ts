import { Expose, Type } from 'class-transformer';
import { PostReactionTypeResponseDto } from 'src/post-reaction-types/dto/response/post-reaction-type-response.dto';

export class PostReactionRecordResponseDto {
  @Expose()
  id: string;

  @Expose()
  @Type(() => PostReactionTypeResponseDto)
  reactionType: PostReactionTypeResponseDto;

  @Expose()
  postId: string;

  @Expose()
  userId: string;

  @Expose()
  createdAt: Date;
}
