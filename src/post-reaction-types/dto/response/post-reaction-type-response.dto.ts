import { Expose } from 'class-transformer';

export class PostReactionTypeResponseDto {
  @Expose()
  id: string;

  @Expose()
  type: string;

  @Expose()
  createdAt: Date;
}
