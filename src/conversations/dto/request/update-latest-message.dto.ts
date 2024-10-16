import { IsUUID } from 'class-validator';

export class UpdateLatestMessageDto {
  @IsUUID('4', { message: 'ID của cuộc trò chuyện phải là UUID v4 hợp lệ.' })
  conversationId: string;

  @IsUUID('4', { message: 'ID của tin nhắn mới nhất phải là UUID v4 hợp lệ.' })
  latestMessageId: string;
}
