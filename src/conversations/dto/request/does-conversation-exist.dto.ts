import { IsUUID, IsBoolean, IsOptional } from 'class-validator';

export class DoesConversationExistDto {
  @IsUUID('4', { message: 'ID của người gửi phải là UUID v4 hợp lệ.' })
  senderId: string;

  @IsUUID('4', { message: 'ID của người nhận phải là UUID v4 hợp lệ.' })
  @IsOptional()
  receiverId?: string;

  @IsBoolean({ message: 'isGroup phải là kiểu boolean.' })
  isGroup: boolean;
}
