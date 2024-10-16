import { Body, Controller, Post } from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { MessageResponse } from 'src/common/decorators/message-response.decorator';
import { CreateConversationDto } from './dto/request/create-conversation.dto';
import { plainToClass } from 'class-transformer';
import { ConversationResponseDto } from './dto/response/conversation-response.dto';
import { AuthUser } from 'src/common/decorators/auth-user.decorator';
import { UsersInterface } from 'src/users/users.interface';

@Controller('conversations')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @MessageResponse('Tạo mới cuộc trò chuyện thành công')
  @Post()
  async createConversation(
    @AuthUser() user: UsersInterface,
    @Body() createConversationDto: CreateConversationDto,
  ) {
    const conversation =
      await this.conversationsService.handleCreateConversation(
        user,
        createConversationDto,
      );

    return plainToClass(ConversationResponseDto, conversation, {
      excludeExtraneousValues: true,
    });
  }
}
