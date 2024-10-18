import { Injectable } from '@nestjs/common';
import { MessagesService } from '../messages/messages.service';
import { ConversationsService } from '../conversations/conversations.service';
import { UsersService } from 'src/users/users.service';
import { CreateMessageDto } from 'src/messages/dto/request/create-message.dto';
import { UsersInterface } from 'src/users/users.interface';
import { plainToClass } from 'class-transformer';
import { MessageResponseDto } from 'src/messages/dto/response/message-response.dto';

@Injectable()
export class ChatsService {
  constructor(
    private readonly messagesService: MessagesService,
    private readonly conversationService: ConversationsService,
    private readonly userService: UsersService,
  ) {}

  async handleSendMessages(user: UsersInterface, request: CreateMessageDto) {
    const { conversationId } = request;

    const conversation = await this.conversationService.getConversationById(
      conversationId,
      user.id,
    );

    const newMessage = plainToClass(MessageResponseDto, await this.messagesService.createMessage(request, user.id), {
      excludeExtraneousValues: true,
    });

    const members = conversation.users.map((user) => user.id);
    
    return { newMessage, members };
  }
}
