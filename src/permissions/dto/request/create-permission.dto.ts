import { IsNotEmpty, IsString } from 'class-validator';
import { ErrorMessages } from 'src/exception/error-messages.enum';

export class CreatePermissionDto {
  @IsNotEmpty({ message: ErrorMessages.PERMISSION_NAME_REQUIRED.message })
  @IsString({ message: ErrorMessages.PERMISSION_NAME_STRING.message })
  name: string;

  @IsNotEmpty({ message: ErrorMessages.PERMISSION_API_PATH_REQUIRED.message })
  @IsString({ message: ErrorMessages.PERMISSION_API_PATH_STRING.message })
  apiPath: string;

  @IsNotEmpty({ message: ErrorMessages.PERMISSION_METHOD_REQUIRED.message })
  @IsString({ message: ErrorMessages.PERMISSION_METHOD_STRING.message })
  method: string;

  @IsNotEmpty({ message: ErrorMessages.PERMISSION_MODULE_REQUIRED.message })
  @IsString({ message: ErrorMessages.PERMISSION_MODULE_STRING.message })
  module: string;
}
