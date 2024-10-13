import {
  IsArray,
  ArrayNotEmpty,
  IsString,
  ArrayMinSize,
} from 'class-validator';
import { ErrorMessages } from 'src/exception/error-messages.enum';

export class UpdatePermissionsToRoleDto {
  @IsArray({ message: ErrorMessages.PERMISSION_ID_ARRAY })
  @ArrayNotEmpty({ message: ErrorMessages.PERMISSION_ID_ARRAY })
  @ArrayMinSize(1, { message: ErrorMessages.PERMISSION_ID_ARRAY })
  @IsString({ each: true, message: ErrorMessages.PERMISSION_ID_ARRAY })
  permissions: string[];
}
