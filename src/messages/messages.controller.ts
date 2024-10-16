import { Body, Controller, Post } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessageResponse } from 'src/common/decorators/message-response.decorator';
import { plainToClass } from 'class-transformer';
import { MessageResponseDto } from './dto/response/message-response.dto';
import { CreateMessageDto } from './dto/request/create-message.dto';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  // @MessageResponse('Tạo mới tin nhắn thành công')
  // @Post()
  // async createMessage(@Body() createMessageDto: CreateMessageDto) {
  //   const conversation =
  //     await this.messagesService.createMessage(createMessageDto);

  //   return plainToClass(MessageResponseDto, conversation, {
  //     excludeExtraneousValues: true,
  //   });
  // }
}
