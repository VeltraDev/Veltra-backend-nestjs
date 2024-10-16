import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { ConversationsService } from 'src/conversations/conversations.service';
import { User } from 'src/users/entities/user.entity';
import { CreateMessageDto } from './dto/request/create-message.dto';
import { Conversation } from 'src/conversations/entities/conversation.entity';
import { ErrorMessages } from 'src/exception/error-messages.enum';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    private readonly conversationService: ConversationsService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createMessage(createMessageDto: CreateMessageDto): Promise<Message> {
    const { content, conversationId, senderId, files } = createMessageDto;

    const conversation =
      await this.conversationService.getConversationById(conversationId);

    const sender = await this.userRepository.findOne({
      where: { id: senderId },
    });

    if (!sender || !conversation.users.some((user) => user.id === senderId)) {
      throw new BadRequestException(
        ErrorMessages.MESSAGE_SENDER_NOT_IN_CONVERSATION.replace(
          '{senderId}',
          senderId,
        ),
      );
    }

    const newMessage = this.messageRepository.create({
      content,
      sender: { id: senderId } as User,
      conversation: { id: conversationId } as Conversation,
      files: files || [],
    });

    return await this.messageRepository.save(newMessage);
  }

  async findMessageById(messageId: string, userId: string): Promise<Message> {
    const message = await this.messageRepository.findOne({
      where: { id: messageId },
      relations: ['sender', 'conversation', 'conversation.users'],
    });

    if (!message) {
      throw new NotFoundException(
        ErrorMessages.MESSAGE_NOT_FOUND.replace('{messageId}', messageId),
      );
    }

    const isUserInConversation = message.conversation.users.some(
      (user) => user.id === userId,
    );
    if (!isUserInConversation) {
      throw new ForbiddenException(ErrorMessages.MESSAGE_NO_ACCESS);
    }

    return message;
  }

  async deleteMessage(messageId: string, userId: string): Promise<void> {
    const message = await this.findMessageById(messageId, userId);

    if (message.sender.id !== userId) {
      throw new ForbiddenException(ErrorMessages.MESSAGE_DELETE_FORBIDDEN);
    }

    await this.messageRepository.remove(message);
  }
}
