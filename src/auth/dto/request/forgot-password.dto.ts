import { IsEmail, IsNotEmpty } from 'class-validator';

export class ForgotPasswordDto {
  @IsNotEmpty({ message: 'Email là bắt buộc' })
  @IsEmail({}, { message: 'Email phải là một địa chỉ email hợp lệ' })
  email: string;
}
