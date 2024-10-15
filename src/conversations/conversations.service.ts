import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Conversation } from './entities/conversation.entity';
import { Repository } from 'typeorm';
import { UsersInterface } from 'src/users/users.interface';
import { CreateOpenConversationDto } from './dto/request/create-open-conversation.dto';

@Injectable()
export class ConversationsService {
  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
  ) {}

  async isConversationExist(senderId: string, receiveId: string) {
    const conversations = await this.conversationRepository.find({
      where: { isGroup: false },
      relations: [
        'userConversations',
        'userConversations.user',
        'latestMessage',
        'latestMessage.sender',
      ],
    });
  }

  async handleCreateOpenConversation(
    user: UsersInterface,
    createOpenConversationDto: CreateOpenConversationDto,
  ) {
    const { receiveId } = createOpenConversationDto;

    // Check conversation existed
    const existedConversation = await this.isConversationExist(
      user.id,
      receiveId,
    );

    return user.id;
  }
}
