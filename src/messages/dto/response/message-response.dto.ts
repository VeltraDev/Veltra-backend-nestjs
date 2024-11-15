import { Expose, Type } from 'class-transformer';
import { UserSecureResponseDto } from 'src/users/dto/response/user-secure-response.dto';

export class MessageResponseDto {
  @Expose()
  id: string;

  @Expose()
  content: string;

  @Expose()
  files: { url: string; type?: string }[];

  @Expose()
  @Type(() => UserSecureResponseDto)
  sender: UserSecureResponseDto;

  @Expose()
  conversationId: string;

  @Expose()
  @Type(() => MessageResponseDto)
  forwardedMessage?: MessageResponseDto;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
