import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';

export class ResetPasswordDto {
  @IsNotEmpty({ message: 'Mật khẩu là bắt buộc' })
  @IsString({ message: 'Mật khẩu phải là chuỗi' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    {
      message:
        'Mật khẩu phải có ít nhất 8 ký tự, bao gồm ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt',
    },
  )
  newPassword: string;

  @IsNotEmpty({ message: 'Xác nhận mật khẩu là bắt buộc' })
  @IsString({ message: 'Xác nhận mật khẩu phải là chuỗi' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    {
      message:
        'Xác nhận mật khẩu phải có ít nhất 8 ký tự, bao gồm ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt',
    },
  )
  confirmPassword: string;

  @IsNotEmpty({ message: 'Token là bắt buộc' })
  @IsString({ message: 'Token phải là chuỗi' })
  token: string;
}
