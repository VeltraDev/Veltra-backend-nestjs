import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { MessageResponse } from 'src/common/decorators/message-response.decorator';
import { CreateConversationDto } from './dto/request/create-conversation.dto';
import { plainToClass, plainToInstance } from 'class-transformer';
import { ConversationResponseDto } from './dto/response/conversation-response.dto';
import { AuthUser } from 'src/common/decorators/auth-user.decorator';
import { UsersInterface } from 'src/users/users.interface';
import { UpdateInfoConversationDto } from './dto/request/update-conversation.dto';
import { UpdateGroupAdminDto } from './dto/request/update-group-admin.dto';
import { AddUsersDto } from './dto/request/add-user.dto';
import { RemoveUsersDto } from './dto/request/remove-user.dto';
import { MessageResponseDto } from 'src/messages/dto/response/message-response.dto';
import { FilterConversationsDto } from './dto/request/filter-conversation.dto';
import { GetOneConversationResponseDto } from './dto/response/get-one-conversation-response.dto';

@Controller('conversations')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @MessageResponse('Tạo mới cuộc trò chuyện thành công')
  @Post()
  async createConversation(
    @AuthUser() user: UsersInterface,
    @Body() createConversationDto: CreateConversationDto,
  ) {
    const conversation = await this.conversationsService.createConversation(
      user,
      createConversationDto,
    );

    return plainToClass(ConversationResponseDto, conversation, {
      excludeExtraneousValues: true,
    });
  }

  @MessageResponse(
    'Lấy danh sách tất cả cuộc trò chuyện của người dùng đang đăng nhập với điều kiện truy vấn thành công',
  )
  @Get()
  async getAllConversations(
    @AuthUser() user: UsersInterface,
    @Query() query: FilterConversationsDto,
  ) {
    const paginatedConversations =
      await this.conversationsService.getAllConversations(user.id, query);

    const results = paginatedConversations.results.map((conversation) =>
      plainToClass(ConversationResponseDto, conversation, {
        excludeExtraneousValues: true,
      }),
    );

    return {
      total: paginatedConversations.total,
      page: paginatedConversations.page,
      limit: paginatedConversations.limit,
      results,
    };
  }

  @MessageResponse('Rời khỏi nhóm thành công')
  @Delete(':id/leave')
  async leaveGroup(
    @Param('id') conversationId: string,
    @AuthUser() user: UsersInterface,
  ) {
    return await this.conversationsService.leaveGroup(conversationId, user.id);
  }

  @MessageResponse('Cập nhật thông tin nhóm thành công')
  @Patch(':id/update-info')
  async updateGroupInfo(
    @Param('id') id: string,
    @Body() updateInfoConversationDto: UpdateInfoConversationDto,
    @AuthUser() user: UsersInterface,
  ) {
    const conversation = await this.conversationsService.updateGroupInfo(
      id,
      updateInfoConversationDto,
      user.id,
    );

    return plainToClass(ConversationResponseDto, conversation, {
      excludeExtraneousValues: true,
    });
  }

  @MessageResponse('Cập nhật admin cho nhóm thành công')
  @Put(':id/update-group-admin')
  async updateGroupAdmin(
    @Param('id') id: string,
    @Body() updateGroupAdminDto: UpdateGroupAdminDto,
    @AuthUser() user: UsersInterface,
  ) {
    const conversation = await this.conversationsService.updateGroupAdmin(
      id,
      updateGroupAdminDto.adminId,
      user.id,
    );

    return plainToClass(ConversationResponseDto, conversation, {
      excludeExtraneousValues: true,
    });
  }

  @MessageResponse('Thêm thành viên vào nhóm thành công')
  @Put(':id/add-users')
  async addUsersToGroup(
    @Param('id') id: string,
    @Body() addUsersDto: AddUsersDto,
    @AuthUser() user: UsersInterface,
  ) {
    const conversation = await this.conversationsService.addUsersToGroup(
      id,
      addUsersDto.userIds,
      user.id,
    );

    return plainToClass(ConversationResponseDto, conversation, {
      excludeExtraneousValues: true,
    });
  }

  @MessageResponse('Xóa thành viên khỏi nhóm thành công')
  @Put(':id/remove-users')
  async removeUsersFromGroup(
    @Param('id') id: string,
    @Body() removeUsersDto: RemoveUsersDto,
    @AuthUser() user: UsersInterface,
  ) {
    const conversation = await this.conversationsService.removeUsersFromGroup(
      id,
      removeUsersDto.userIds,
      user.id,
    );

    return plainToClass(ConversationResponseDto, conversation, {
      excludeExtraneousValues: true,
    });
  }

  @MessageResponse('Lấy thông tin một cuộc trò chuyện thành công')
  @Get(':id')
  async getConversation(
    @Param('id') id: string,
    @AuthUser() user: UsersInterface,
  ) {
    const conversation = await this.conversationsService.getConversationById(
      id,
      user.id,
    );

    const messageDtos = plainToInstance(
      MessageResponseDto,
      conversation.messages,
      {
        excludeExtraneousValues: true,
      },
    );

    return plainToInstance(
      GetOneConversationResponseDto,
      {
        ...conversation,
        messages: messageDtos, 
      },
      {
        excludeExtraneousValues: true,
      },
    );
  }

  @Delete(':id')
  @MessageResponse('Xóa cuộc trò chuyện hoặc nhóm thành công')
  async deleteConversation(
    @Param('id') id: string,
    @AuthUser() user: UsersInterface,
  ) {
    return await this.conversationsService.deleteConversation(id, user.id);
  }
}
