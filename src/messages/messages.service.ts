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
        `Người gửi với ID ${senderId} không nằm trong cuộc trò chuyện.`,
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

  async findMessageById(messageId: string): Promise<Message> {
    const message = await this.messageRepository.findOne({
      where: { id: messageId },
      relations: ['sender', 'conversation'],
    });

    if (!message) {
      throw new NotFoundException(
        `Tin nhắn với ID ${messageId} không tồn tại.`,
      );
    }

    return message;
  }

  async deleteMessage(messageId: string, userId: string): Promise<void> {
    const message = await this.findMessageById(messageId);

    if (message.sender.id !== userId) {
      throw new ForbiddenException('Bạn không có quyền xóa tin nhắn này.');
    }

    await this.messageRepository.remove(message);
  }
}
