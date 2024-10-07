import { IsOptional, IsString, IsPhoneNumber } from 'class-validator';

export class UpdateProfileInformationDto {
  @IsOptional()
  @IsString({ message: 'Tên phải là chuỗi ký tự' })
  firstName?: string;

  @IsOptional()
  @IsString({ message: 'Họ phải là chuỗi ký tự' })
  lastName?: string;

  @IsOptional()
  @IsString({ message: 'Avatar phải là chuỗi ký tự' })
  avatar?: string;

  @IsOptional()
  @IsPhoneNumber('VN', {
    message: 'Số điện thoại phải là số hợp lệ tại Việt Nam',
  })
  phone?: string;

  @IsOptional()
  @IsString({ message: 'Trạng thái hiển thị phải là chuỗi ký tự' })
  displayStatus?: string;
}
