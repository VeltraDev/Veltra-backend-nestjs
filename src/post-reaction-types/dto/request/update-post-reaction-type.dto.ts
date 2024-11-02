import { PartialType } from '@nestjs/swagger';
import { CreatePostReactionTypeDto } from './create-post-reaction-type.dto';

export class UpdatePostReactionTypeDto extends PartialType(
  CreatePostReactionTypeDto,
) {}
