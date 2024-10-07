import { UserResponseDto } from 'src/users/dto/response/user-response.dto';

export class AuthenticationResponse {
  access_token: string;
  user: UserResponseDto;
}
