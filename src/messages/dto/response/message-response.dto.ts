import { Expose, Type } from 'class-transformer';
import { UserSecureResponseDto } from 'src/users/dto/response/user-secure-response.dto';

export class MessageResponseDto {
  @Expose()
  id: string;

  @Expose()
  content: string;

  @Expose()
  @Type(() => UserSecureResponseDto)
  sender: UserSecureResponseDto;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
