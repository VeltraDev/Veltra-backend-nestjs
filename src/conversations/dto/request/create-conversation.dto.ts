import {
  IsString,
  IsBoolean,
  IsArray,
  ArrayMinSize,
  IsOptional,
  IsUUID,
} from 'class-validator';

export class CreateConversationDto {
  @IsString({ message: 'Tên cuộc trò chuyện phải là chuỗi.' })
  @IsOptional()
  name?: string;

  @IsString({ message: 'Hình ảnh cuộc trò chuyện phải là chuỗi.' })
  @IsOptional()
  picture?: string;

  @IsBoolean({ message: 'Trạng thái nhóm phải là kiểu boolean.' })
  @IsOptional()
  isGroup: boolean;

  @IsArray({ message: 'Danh sách người dùng phải là một mảng.' })
  @ArrayMinSize(2, {
    message: 'Cần ít nhất 2 người dùng để tạo một cuộc trò chuyện.',
  })
  @IsUUID('4', {
    each: true,
    message: 'ID của mỗi người dùng phải là UUID v4 hợp lệ.',
  })
  users: string[];
}
