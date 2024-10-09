import { Expose, Type } from 'class-transformer';
import { PermissionResponseDto } from 'src/permissions/dto/response/permission-response.dto';
import { UserResponseDto } from 'src/users/dto/response/user-response.dto';

export class RoleResponseDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  description: string;

  @Expose()
  isActive: string;

  @Expose()
  createdAt: string;

  @Expose()
  @Type(() => PermissionResponseDto)
  permissions: PermissionResponseDto[];

  // @Expose()
  // @Type(() => UserResponseDto)
  // users: UserResponseDto[];
}
