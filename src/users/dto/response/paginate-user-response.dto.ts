import { PaginatedDto } from 'src/dto/paginate-response.dto';
import { UserResponseDto } from './user-response.dto';

export class PaginatedUsersDto extends PaginatedDto<UserResponseDto> {}
