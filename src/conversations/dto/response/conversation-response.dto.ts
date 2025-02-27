import { Expose, Type } from 'class-transformer';
import { MessageResponseDto } from 'src/messages/dto/response/message-response.dto';
import { UserSecureResponseDto } from 'src/users/dto/response/user-secure-response.dto';

export class ConversationResponseDto {
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
  latestMessage?: MessageResponseDto;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
