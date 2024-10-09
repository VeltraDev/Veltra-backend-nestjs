import { PaginatedDto } from 'src/common/dto/paginate-response.dto';
import { PermissionResponseDto } from './permission-response.dto';

export class PaginatedPermissionsDto extends PaginatedDto<PermissionResponseDto> {}
    