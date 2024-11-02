import { PartialType } from '@nestjs/swagger';
import { CreatePostReactionRecordDto } from './create-post-reaction-record.dto';

export class UpdatePostReactionRecordDto extends PartialType(
  CreatePostReactionRecordDto,
) {}
