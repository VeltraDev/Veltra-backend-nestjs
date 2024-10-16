import { Expose } from 'class-transformer';

export class UserSecureResponseDto {
  @Expose()
  id: string;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose()
  email: string;

  @Expose()
  avatar?: string;
}
