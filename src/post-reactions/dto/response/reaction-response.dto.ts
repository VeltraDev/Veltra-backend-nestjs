import { Expose, Type } from 'class-transformer';
import { UserSecureResponseDto } from 'src/users/dto/response/user-secure-response.dto';
import { ReactionTypeResponseDto } from 'src/reaction-types/dto/response/reaction-type-response.dto';
import { PostResponseDto } from 'src/posts/dto/response/post-response.dto';

export class ReactionResponseDto {
  @Expose()
  id: string;

  @Expose()
  @Type(() => UserSecureResponseDto)
  user: UserSecureResponseDto;

  @Expose()
  @Type(() => PostResponseDto)
  post: PostResponseDto;

  @Expose()
  @Type(() => ReactionTypeResponseDto)
  reactionType: ReactionTypeResponseDto;
}
