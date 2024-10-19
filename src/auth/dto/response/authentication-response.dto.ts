import { Expose, Type } from 'class-transformer';
import { UserSecureResponseDto } from 'src/users/dto/response/user-secure-response.dto';

export class AuthenticationResponse {
  @Expose()
  access_token: string;

  @Expose()
  @Type(() => UserSecureResponseDto)
  user: UserSecureResponseDto;
}
