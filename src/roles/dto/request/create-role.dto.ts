import { IsNotEmpty, IsString, IsBoolean, IsOptional } from 'class-validator';
import { ErrorMessages } from 'src/exception/error-messages.enum';

export class CreateRoleDto {
  @IsNotEmpty({ message: ErrorMessages.ROLE_NAME_REQUIRED })
  @IsString({ message: ErrorMessages.ROLE_NAME_STRING })
  name: string;

  @IsOptional()
  @IsString({ message: ErrorMessages.ROLE_DESCRIPTION_STRING })
  description?: string;

  @IsOptional()
  @IsBoolean({ message: ErrorMessages.ROLE_IS_ACTIVE_BOOLEAN })
  isActive?: boolean;
}
