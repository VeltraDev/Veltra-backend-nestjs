import { PaginatedDto } from 'src/common/dto/paginate-response.dto';
import { ConversationResponseDto } from './conversation-response.dto';

export class PaginatedConversationsDto extends PaginatedDto<ConversationResponseDto> {}
