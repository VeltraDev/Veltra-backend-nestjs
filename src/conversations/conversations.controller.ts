import {
  Controller,
  Get,
  Post,
  Body,
  InternalServerErrorException,
} from '@nestjs/common';
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

  @MessageResponse('Tạo mới hoặc mở cuộc trò chuyện thành công')
  @Post()
  async createOpenConversation(
    @AuthUser() user: UsersInterface,
    @Body() createConversationDto: CreateConversationDto,
  ) {
    const conversation =
      await this.conversationsService.createOrOpenConversation(
        user.id,
        createConversationDto.users[0],
        createConversationDto.isGroup,
      );

    return plainToClass(ConversationResponseDto, conversation, {
      excludeExtraneousValues: true,
    });
  }

  @MessageResponse(
    'Lấy thông tin tất cả cuộc trò chuyện của người dùng thành công',
  )
  @Get()
  async getAllConversations(@AuthUser() user: UsersInterface) {
    try {
      const conversations =
        await this.conversationsService.getUserConversations(user.id);

      return conversations.map((conversation) =>
        plainToClass(ConversationResponseDto, conversation, {
          excludeExtraneousValues: true,
        }),
      );
    } catch (error) {
      throw new InternalServerErrorException(
        'Oops...Something went wrong while fetching conversations!',
      );
    }
  }

  @MessageResponse('Tạo mới nhóm trò chuyện thành công')
  @Post('group')
  async createGroupConversation(
    @AuthUser() user: UsersInterface,
    @Body() createConversationDto: CreateConversationDto,
  ) {
    const conversation =
      await this.conversationsService.createGroupConversation(
        user.id,
        createConversationDto.name,
        createConversationDto.users,
      );

    return plainToClass(ConversationResponseDto, conversation, {
      excludeExtraneousValues: true,
    });
  }
}
