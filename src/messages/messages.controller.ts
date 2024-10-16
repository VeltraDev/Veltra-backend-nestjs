import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessageResponse } from 'src/common/decorators/message-response.decorator';
import { plainToClass } from 'class-transformer';
import { MessageResponseDto } from './dto/response/message-response.dto';
import { CreateMessageDto } from './dto/request/create-message.dto';
import { AuthUser } from 'src/common/decorators/auth-user.decorator';
import { UsersInterface } from 'src/users/users.interface';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @MessageResponse('Tạo mới tin nhắn thành công')
  @Post()
  async createMessage(@Body() createMessageDto: CreateMessageDto) {
    const conversation =
      await this.messagesService.createMessage(createMessageDto);

    return plainToClass(MessageResponseDto, conversation, {
      excludeExtraneousValues: true,
    });
  }

  @MessageResponse('Lấy thông tin một tin nhắn thành công')
  @Get(':id')
  async getMessageById(@Param('id') messageId: string) {
    const message = await this.messagesService.findMessageById(messageId);

    return plainToClass(MessageResponseDto, message, {
      excludeExtraneousValues: true,
    });
  }

  @MessageResponse('Xóa tin nhắn thành công')
  @Delete(':id')
  async deleteMessage(
    @Param('id') messageId: string,
    @AuthUser() user: UsersInterface,
  ) {
    await this.messagesService.deleteMessage(messageId, user.id);
    return { message: 'Tin nhắn đã được xóa thành công.' };
  }
}
