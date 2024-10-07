import { IsString, MinLength, Matches, IsNotEmpty } from 'class-validator';

export class UpdateProfilePasswordDto {
  @IsNotEmpty({ message: 'Mật khẩu hiện tại là bắt buộc' })
  @IsString({ message: 'Mật khẩu hiện tại phải là chuỗi' })
  currentPassword: string;

  @IsNotEmpty({ message: 'Mật khẩu mới là bắt buộc' })
  @IsString({ message: 'Mật khẩu mới phải là chuỗi' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    {
      message:
        'Mật khẩu mới phải có ít nhất 8 ký tự, bao gồm ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt',
    },
  )
  newPassword: string;

  @IsNotEmpty({ message: 'Xác nhận mật khẩu mới là bắt buộc' })
  @IsString({ message: 'Xác nhận mật khẩu mới phải là chuỗi' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    {
      message:
        'Xác nhận mật khẩu mới phải có ít nhất 8 ký tự, bao gồm ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt',
    },
  )
  confirmPassword: string;
}
