import { IsNotEmpty, IsString } from 'class-validator';
import { ErrorMessages } from 'src/exception/error-messages.enum';

export class CreatePermissionDto {
  @IsNotEmpty({ message: ErrorMessages.PERMISSION_NAME_REQUIRED })
  @IsString({ message: ErrorMessages.PERMISSION_NAME_STRING })
  name: string;

  @IsNotEmpty({ message: ErrorMessages.PERMISSION_API_PATH_REQUIRED })
  @IsString({ message: ErrorMessages.PERMISSION_API_PATH_STRING })
  apiPath: string;

  @IsNotEmpty({ message: ErrorMessages.PERMISSION_METHOD_REQUIRED })
  @IsString({ message: ErrorMessages.PERMISSION_METHOD_STRING })
  method: string;

  @IsNotEmpty({ message: ErrorMessages.PERMISSION_MODULE_REQUIRED })
  @IsString({ message: ErrorMessages.PERMISSION_MODULE_STRING })
  module: string;
}
