import {
  IsOptional,
  IsString,
  IsBoolean,
  IsPhoneNumber,
} from 'class-validator';

export class UpdateUserAdminDto {
  @IsOptional()
  @IsString({ message: 'Họ bắt buộc phải là chuỗi ký tự' })
  firstName?: string;

  @IsOptional()
  @IsString({ message: 'Tên bắt buộc phải là chuỗi ký tự' })
  lastName?: string;

  @IsOptional()
  @IsString({ message: 'Ảnh đại diện bắt buộc phải là chuỗi ký tự' })
  avatar?: string;

  @IsOptional()
  @IsPhoneNumber('VN', {
    message: 'Số điện thoại phải là số hợp lệ tại Việt Nam',
  })
  phone?: string;

  @IsOptional()
  @IsString({ message: 'Trạng thái hiển thị phải là chuỗi ký tự' })
  displayStatus?: string;

  @IsOptional()
  @IsBoolean({ message: 'Trạng thái xác thực phải là boolean' })
  isVerified?: boolean;
}
