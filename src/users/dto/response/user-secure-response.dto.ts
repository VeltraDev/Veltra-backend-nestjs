import { Expose, Type } from 'class-transformer';
import { RoleSecureResponseDto } from 'src/roles/dto/response/role-secure-response.dto';

export class UserSecureResponseDto {
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
  @Type(() => RoleSecureResponseDto)
  role: RoleSecureResponseDto;
}
