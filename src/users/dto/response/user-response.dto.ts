import { Expose } from 'class-transformer';

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
  phone: string;

  @Expose()
  isVerified: boolean;

  @Expose()
  createdAt: Date;
}
