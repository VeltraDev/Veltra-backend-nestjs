import { SetMetadata } from '@nestjs/common';

export const IS_MESSAGE_RESPONSE = 'message_response';
export const MessageResponse = (message: string) =>
  SetMetadata(IS_MESSAGE_RESPONSE, message);
