import { IsOptional, IsString } from 'class-validator';

export class UpdateInfoConversationDto {
  @IsOptional()
  @IsString({ message: 'Tên cuộc trò chuyện phải là chuỗi.' })
  name?: string;

  @IsOptional()
  @IsString({ message: 'Đường dẫn hình ảnh phải là chuỗi.' })
  picture?: string;
}
