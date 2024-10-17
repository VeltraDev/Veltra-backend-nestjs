import { Expose, Type } from 'class-transformer';
import { MessageResponseDto } from 'src/messages/dto/response/message-response.dto';
import { UserSecureResponseDto } from 'src/users/dto/response/user-secure-response.dto';

export class GetOneConversationResponseDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  picture: string;

  @Expose()
  isGroup: boolean;

  @Expose()
  @Type(() => UserSecureResponseDto)
  users: UserSecureResponseDto[];

  @Expose()
  @Type(() => UserSecureResponseDto)
  admin?: UserSecureResponseDto;

  @Expose()
  @Type(() => MessageResponseDto)
  messages?: MessageResponseDto[];

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
