import { Body, Controller, Post } from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { MessageResponse } from 'src/common/decorators/message-response.decorator';
import { AuthUser } from 'src/common/decorators/auth-user.decorator';
import { UsersInterface } from 'src/users/users.interface';
import { CreateOpenConversationDto } from './dto/request/create-open-conversation.dto';

@Controller('conversations')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @MessageResponse('Tạo mới hoặc mở cuộc trò chuyện thành công')
  @Post()
  async createOpenConversation(
    @AuthUser() user: UsersInterface,
    @Body() createOpenConversationDto: CreateOpenConversationDto,
  ) {
    return await this.conversationsService.handleCreateOpenConversation(
      user,
      createOpenConversationDto,
    );
  }
}
