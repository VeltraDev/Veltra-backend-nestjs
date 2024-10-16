import { IsArray, IsUUID, ArrayNotEmpty } from 'class-validator';

export class AddUsersDto {
  @IsArray({ message: 'Danh sách userIds phải là một mảng.' })
  @ArrayNotEmpty({ message: 'Danh sách userIds không được rỗng.' })
  @IsUUID('4', { each: true, message: 'Mỗi userId phải là UUID v4 hợp lệ.' })
  userIds: string[];
}
