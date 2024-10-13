import { Expose, Type } from 'class-transformer';
import { RoleResponseDto } from 'src/roles/dto/response/role-response.dto';

export class UserResponseDto {
  @Expose()
  id: string;

  @Expose()
  email: string;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose()
  avatar: string;

  @Expose()
  displayStatus: string;

  @Expose()
  createdAt: Date;

  @Expose()
  @Type(() => RoleResponseDto)
  role: RoleResponseDto;
}
