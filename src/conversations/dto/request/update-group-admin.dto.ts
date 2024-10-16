import { IsUUID } from 'class-validator';

export class UpdateGroupAdminDto {
  @IsUUID('4', { message: 'ID admin nhóm phải là UUIDv4 hợp lệ.' })
  adminId: string;
}
