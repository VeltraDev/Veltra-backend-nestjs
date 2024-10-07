import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';

export class VerifyEmailDto {
  @IsNotEmpty({ message: 'Mã xác thực là bắt buộc' })
  @IsString({ message: 'Mã xác thực phải là chuỗi' })
  token: string;
}
