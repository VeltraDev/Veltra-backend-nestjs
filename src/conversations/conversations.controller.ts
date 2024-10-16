import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { MessageResponse } from 'src/common/decorators/message-response.decorator';
import { CreateConversationDto } from './dto/request/create-conversation.dto';
import { plainToClass } from 'class-transformer';
import { ConversationResponseDto } from './dto/response/conversation-response.dto';
import { AuthUser } from 'src/common/decorators/auth-user.decorator';
import { UsersInterface } from 'src/users/users.interface';
import { UpdateInfoConversationDto } from './dto/request/update-conversation.dto';
import { UpdateGroupAdminDto } from './dto/request/update-group-admin.dto';
import { AddUsersDto } from './dto/request/add-user.dto';
import { RemoveUsersDto } from './dto/request/remove-user.dto';

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

  @MessageResponse('Cập nhật thông tin nhóm thành công')
  @Patch(':id/update-info')
  async updateGroupInfo(
    @Param('id') id: string,
    @Body() updateInfoConversationDto: UpdateInfoConversationDto,
  ) {
    const conversation = await this.conversationsService.updateGroupInfo(
      id,
      updateInfoConversationDto,
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
  ) {
    const conversation = await this.conversationsService.updateGroupAdmin(
      id,
      updateGroupAdminDto.adminId,
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
  ) {
    const conversation = await this.conversationsService.addUsersToGroup(
      id,
      addUsersDto.userIds,
    );

    return plainToClass(ConversationResponseDto, conversation, {
      excludeExtraneousValues: true,
    });
  }

  @Put(':id/remove-users')
  @MessageResponse('Xóa thành viên khỏi nhóm thành công')
  async removeUsersFromGroup(
    @Param('id') id: string,
    @Body() removeUsersDto: RemoveUsersDto,
  ) {
    const conversation = await this.conversationsService.removeUsersFromGroup(
      id,
      removeUsersDto.userIds,
    );

    return plainToClass(ConversationResponseDto, conversation, {
      excludeExtraneousValues: true,
    });
  }

  @MessageResponse('Lấy thông tin một cuộc trò chuyện thành công')
  @Get(':id')
  async getConversation(@Param('id') id: string) {
    const conversation =
      await this.conversationsService.getConversationById(id);

    return plainToClass(ConversationResponseDto, conversation, {
      excludeExtraneousValues: true,
    });
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
