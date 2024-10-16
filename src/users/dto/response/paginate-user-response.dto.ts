import { PaginatedDto } from 'src/common/dto/paginate-response.dto';
import { UserResponseDto } from './user-response.dto';

export class PaginatedUsersDto extends PaginatedDto<UserResponseDto> {}
