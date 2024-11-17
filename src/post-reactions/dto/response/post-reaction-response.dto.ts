import { Expose, Type } from 'class-transformer';
import { UserSecureResponseDto } from 'src/users/dto/response/user-secure-response.dto';
import { ReactionTypeResponseDto } from 'src/reaction-types/dto/response/reaction-type-response.dto';

export class PostReactionResponseDto {
  @Expose()
  id: string;

  @Expose()
  @Type(() => UserSecureResponseDto)
  reactedBy: UserSecureResponseDto;

  @Expose()
  @Type(() => ReactionTypeResponseDto)
  reactionType: ReactionTypeResponseDto;
}
