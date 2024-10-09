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
  @IsNotEmpty({ message: ErrorMessages.ROLE_NAME_REQUIRED })
  @IsString({ message: ErrorMessages.ROLE_NAME_STRING })
  name: string;

  @IsOptional()
  @IsString({ message: ErrorMessages.ROLE_DESCRIPTION_STRING })
  description?: string;

  @IsOptional()
  @IsBoolean({ message: ErrorMessages.ROLE_IS_ACTIVE_BOOLEAN })
  isActive?: boolean;

  @IsOptional()
  @IsArray({ message: ErrorMessages.PERMISSION_ID_ARRAY })
  @Type(() => String)
  permissions?: string[];

  @IsOptional()
  @IsArray({ message: ErrorMessages.USER_ID_ARRAY })
  @Type(() => String)
  users?: string[];
}
