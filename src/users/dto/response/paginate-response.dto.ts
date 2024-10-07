import { UserResponseDto } from './user-response.dto';

export class PaginatedUsersDto {
  total: number;
  page: number;
  limit: number;
  results: UserResponseDto[];
}
