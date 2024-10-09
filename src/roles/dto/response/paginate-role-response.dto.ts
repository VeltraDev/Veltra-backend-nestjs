import { PaginatedDto } from 'src/common/dto/paginate-response.dto';
import { RoleResponseDto } from './role-response.dto';

export class PaginatedPermissionsDto extends PaginatedDto<RoleResponseDto> {}
