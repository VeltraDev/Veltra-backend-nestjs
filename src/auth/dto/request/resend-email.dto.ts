import { IsEmail, IsNotEmpty } from 'class-validator';

export class ResendEmailDto {
  @IsEmail({}, { message: 'Email phải là một địa chỉ email hợp lệ' })
  @IsNotEmpty({ message: 'Email là bắt buộc' })
  email: string;
}
