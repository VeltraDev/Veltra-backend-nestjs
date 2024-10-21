import {
  IsNotEmpty,
  IsString,
  IsBoolean,
  IsOptional,
  IsArray,
} from 'class-validator';
import { ErrorMessages } from 'src/exception/error-messages.enum';
import { Type } from 'class-transformer';

export class CreateRoleDto {
  @IsNotEmpty({ message: ErrorMessages.ROLE_NAME_REQUIRED.message })
  @IsString({ message: ErrorMessages.ROLE_NAME_STRING.message })
  name: string;

  @IsOptional()
  @IsString({ message: ErrorMessages.ROLE_DESCRIPTION_STRING.message })
  description?: string;

  @IsOptional()
  @IsBoolean({ message: ErrorMessages.ROLE_IS_ACTIVE_BOOLEAN.message })
  isActive?: boolean;

  @IsOptional()
  @IsArray({ message: ErrorMessages.PERMISSION_ID_ARRAY.message })
  @Type(() => String)
  permissions?: string[];
}
