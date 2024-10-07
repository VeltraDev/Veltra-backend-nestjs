import {
  IsOptional,
  IsString,
  IsPhoneNumber, IsNotEmpty,
} from 'class-validator';

export class UpdateUserDtoForUser {
  @IsOptional()
  @IsString({ message: 'Họ và tên phải là chuỗi' })
  fullName?: string;

  @IsNotEmpty({
    message: 'Mật khẩu hiện tại là bắt buộc để xác thực trước khi cập nhật',
  })
  @IsString({ message: 'Mật khẩu hiện tại phải là chuỗi' })
  password: string;

  @IsOptional()
  @IsString({ message: 'Mật khẩu mới phải là chuỗi' })
  newPassword?: string;

  @IsOptional()
  @IsString({ message: 'Số điện thoại phải là chuỗi' })
  @IsPhoneNumber('VN', {
    message: 'Số điện thoại phải là số điện thoại hợp lệ tại Việt Nam',
  })
  phone?: string;
}
