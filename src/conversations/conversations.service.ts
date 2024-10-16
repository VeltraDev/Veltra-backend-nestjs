import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Conversation } from './entities/conversation.entity';
import { In, Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Message } from 'src/messages/entities/message.entity';
import { CreateConversationDto } from './dto/request/create-conversation.dto';
import { UsersInterface } from 'src/users/users.interface';

@Injectable()
export class ConversationsService {
  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
  ) {}

  async handleCreateConversation(
    user: UsersInterface,
    createConversationDto: CreateConversationDto,
  ): Promise<Conversation> {
    const { users } = createConversationDto;

    if (users.includes(user.id)) {
      throw new BadRequestException(
        'Người dùng không thể tạo cuộc trò chuyện với chính mình.',
      );
    }

    users.push(user.id);

    const userEntities = await this.userRepository.findBy({ id: In(users) });

    if (userEntities.length !== users.length) {
      const foundUserIds = userEntities.map((user) => user.id);
      const missingUserIds = users.filter(
        (userId) => !foundUserIds.includes(userId),
      );
      throw new BadRequestException(
        `Người dùng với các ID ${missingUserIds.join(', ')} không tồn tại`,
      );
    }

    const isGroup = users.length > 2;

    const newConversation = this.conversationRepository.create({
      isGroup,
      users: userEntities,
      admin: isGroup ? userEntities.find((u) => u.id === user.id) : null,
    });

    return await this.conversationRepository.save(newConversation);
  }
}
