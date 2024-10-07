import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';

export class RegisterUserDto {
  @IsNotEmpty({ message: 'Email là bắt buộc' })
  @IsEmail({}, { message: 'Email phải là một địa chỉ email hợp lệ' })
  email: string;

  @IsNotEmpty({ message: 'Mật khẩu là bắt buộc' })
  @IsString({ message: 'Mật khẩu phải là chuỗi' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
    message:
      'Mật khẩu phải có ít nhất 8 ký tự, bao gồm ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt',
  })
  password: string;

  @IsNotEmpty({ message: 'Tên là bắt buộc' })
  @IsString({ message: 'Tên phải là chuỗi' })
  firstName: string;

  @IsNotEmpty({ message: 'Họ là bắt buộc' })
  @IsString({ message: 'Họ phải là chuỗi' })
  lastName: string;
}