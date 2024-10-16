import { IsArray, ArrayMinSize, IsUUID } from 'class-validator';

export class CreateConversationDto {
  @IsArray({ message: 'Danh sách người dùng phải là một mảng.' })
  @ArrayMinSize(1, {
    message: 'Phải có ít nhất 1 người dùng trong cuộc trò chuyện.',
  })
  @IsUUID('all', {
    each: true,
    message: 'ID của người dùng phải là UUID hợp lệ.',
  })
  users: string[];
}
