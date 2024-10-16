import { IsUUID } from 'class-validator';
import { ErrorMessages } from 'src/exception/error-messages.enum';

export class UpdateGroupAdminDto {
  @IsUUID('4', { message: ErrorMessages.CONVERSATION_ADMIN_UUID })
  adminId: string;
}
