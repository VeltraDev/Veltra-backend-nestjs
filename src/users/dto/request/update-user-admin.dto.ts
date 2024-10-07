import {
  IsOptional,
  IsString,
  IsPhoneNumber,
  IsIn,
  IsEmail,
} from 'class-validator';

export class UpdateUserDtoForAdmin {
  @IsOptional()
  @IsString({ message: 'Họ và tên phải là chuỗi' })
  fullName?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Email phải là một địa chỉ email hợp lệ' })
  email?: string;

  @IsOptional()
  @IsString({ message: 'Mật khẩu phải là chuỗi' })
  password?: string;

  @IsOptional()
  @IsString({ message: 'Số điện thoại phải là chuỗi' })
  @IsPhoneNumber('VN', {
    message: 'Số điện thoại phải là số điện thoại hợp lệ tại Việt Nam',
  })
  phone?: string;

  // @IsOptional()
  // @IsString({ message: 'Vai trò phải là chuỗi' })
  // @IsIn(['USER', 'ADMIN'], { message: 'Vai trò phải là USER hoặc ADMIN' })
  // role?: string;
}

