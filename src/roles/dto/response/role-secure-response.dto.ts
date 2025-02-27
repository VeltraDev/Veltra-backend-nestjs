import { Expose } from 'class-transformer';

export class RoleSecureResponseDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  description: string;
  
  @Expose()
  createdAt: string;
}
