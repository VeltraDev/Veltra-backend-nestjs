import { Expose } from 'class-transformer';

export class RoleResponseDto {
  @Expose()
  id: string;
}
