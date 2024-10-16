import {
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsUUID,
  IsString,
} from 'class-validator';

export class CreateMessageDto {
  @IsNotEmpty({ message: 'Nội dung tin nhắn không được để trống.' })
  @IsString({ message: 'Nội dung tin nhắn phải là chuỗi ký tự.' })
  content: string;

  @IsUUID('4', { message: 'ID của cuộc trò chuyện phải là UUID hợp lệ.' })
  @IsNotEmpty({ message: 'ID cuộc trò chuyện không được để trống.' })
  conversationId: string;

  @IsUUID('4', { message: 'ID của người gửi phải là UUID hợp lệ.' })
  @IsNotEmpty({ message: 'ID người gửi không được để trống.' })
  senderId: string;

  @IsArray({ message: 'Files phải là một mảng đối tượng.' })
  @IsOptional()
  files?: { url: string; type?: string }[];
}
