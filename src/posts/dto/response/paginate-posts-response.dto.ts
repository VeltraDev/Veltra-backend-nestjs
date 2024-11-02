import { PaginatedDto } from 'src/common/dto/paginate-response.dto';
import { PostResponseDto } from './post-response.dto';

export class PaginatedPostsDto extends PaginatedDto<PostResponseDto> {}
