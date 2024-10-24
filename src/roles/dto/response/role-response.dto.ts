import { Expose, Type } from 'class-transformer';
import { PermissionResponseDto } from 'src/permissions/dto/response/permission-response.dto';

export class RoleResponseDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  description: string;

  @Expose()
  createdAt: string;

  @Expose()
  @Type(() => PermissionResponseDto)
  permissions: PermissionResponseDto[];
}
