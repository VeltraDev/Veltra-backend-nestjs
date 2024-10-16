import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Conversation } from './entities/conversation.entity';
import { In, Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { CreateConversationDto } from './dto/request/create-conversation.dto';
import { UsersInterface } from 'src/users/users.interface';
import { UpdateInfoConversationDto } from './dto/request/update-conversation.dto';
import { Message } from 'src/messages/entities/message.entity';

@Injectable()
export class ConversationsService {
  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
  ) {}

  async getLatestMessage(conversationId: string): Promise<Message> {
    const conversation = await this.getConversationById(conversationId);

    const latestMessage = await this.messageRepository.findOne({
      where: { conversation: { id: conversation.id } },
      order: { createdAt: 'DESC' },
    });

    return latestMessage;
  }

  async getUserConversations(userId: string): Promise<Conversation[]> {
    return await this.conversationRepository.find({
      where: { users: { id: userId } },
      relations: ['users', 'admin', 'messages'],
    });
  }

  async findConversationById(
    id: string,
    relations: string[] = [],
  ): Promise<Conversation> {
    const conversation = await this.conversationRepository.findOne({
      where: { id },
      relations,
    });

    if (!conversation) {
      throw new NotFoundException(
        `Cuộc trò chuyện với ID ${id} không tồn tại.`,
      );
    }

    return conversation;
  }

  async validateUsersExist(userIds: string[]): Promise<User[]> {
    const users = await this.userRepository.findBy({ id: In(userIds) });

    if (users.length !== userIds.length) {
      const foundUserIds = users.map((user) => user.id);
      const missingUserIds = userIds.filter(
        (userId) => !foundUserIds.includes(userId),
      );
      throw new BadRequestException(
        `Người dùng với các ID ${missingUserIds.join(', ')} không tồn tại.`,
      );
    }

    return users;
  }

  async removeConversationIfOnlyOneUser(
    conversation: Conversation,
  ): Promise<void> {
    if (conversation.users.length === 1) {
      await this.conversationRepository.remove(conversation);
      throw new BadRequestException(
        'Cuộc trò chuyện đã bị xóa vì chỉ còn 1 thành viên.',
      );
    }
  }

  async createConversation(
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

    const userEntities = await this.validateUsersExist(users);

    const isGroup = users.length > 2;

    const newConversation = this.conversationRepository.create({
      isGroup,
      users: userEntities,
      admin: isGroup ? userEntities.find((u) => u.id === user.id) : null,
    });

    return await this.conversationRepository.save(newConversation);
  }

  async getConversationById(id: string): Promise<Conversation> {
    return await this.findConversationById(id, ['users', 'admin', 'messages']);
  }

  async updateGroupInfo(
    id: string,
    updateInfoConversationDto: UpdateInfoConversationDto,
  ): Promise<Conversation> {
    const { name, picture } = updateInfoConversationDto;

    const conversation = await this.getConversationById(id);

    await this.removeConversationIfOnlyOneUser(conversation);

    if (name) conversation.name = name;
    if (picture) conversation.picture = picture;

    return await this.conversationRepository.save(conversation);
  }

  async updateGroupAdmin(id: string, adminId: string): Promise<Conversation> {
    const conversation = await this.getConversationById(id);

    if (!conversation.isGroup) {
      throw new BadRequestException(
        'Không thể cập nhật admin cho cuộc trò chuyện 1-1.',
      );
    }

    const newAdmin = await this.userRepository.findOne({
      where: { id: adminId },
    });
    if (!newAdmin || !conversation.users.some((u) => u.id === adminId)) {
      throw new BadRequestException(
        'Admin mới không hợp lệ hoặc không phải thành viên nhóm.',
      );
    }

    conversation.admin = newAdmin;
    return await this.conversationRepository.save(conversation);
  }

  async addUsersToGroup(id: string, userIds: string[]): Promise<Conversation> {
    const conversation = await this.getConversationById(id);

    const usersToAdd = await this.validateUsersExist(userIds);

    const existingUsers = conversation.users.map((user) => user.id);
    const alreadyInGroup = userIds.filter((userId) =>
      existingUsers.includes(userId),
    );
    const newUsers = usersToAdd.filter(
      (user) => !existingUsers.includes(user.id),
    );

    if (newUsers.length === 0) {
      throw new BadRequestException(
        `Tất cả người dùng với các ID sau đã là thành viên của nhóm: ${alreadyInGroup.join(', ')}.`,
      );
    }

    if (alreadyInGroup.length > 0) {
      throw new BadRequestException(
        `Các người dùng sau đã là thành viên của nhóm: ${alreadyInGroup.join(', ')}. Những người dùng còn lại sẽ được thêm vào nhóm.`,
      );
    }

    conversation.users.push(...newUsers);

    return await this.conversationRepository.save(conversation);
  }

  async removeUsersFromGroup(
    id: string,
    userIds: string[],
  ): Promise<Conversation> {
    const conversation = await this.getConversationById(id);

    if (!conversation.isGroup) {
      throw new NotFoundException(
        `Cuộc trò chuyện với ID ${id} không phải là nhóm.`,
      );
    }

    const existingUsers = conversation.users.map((user) => user.id);
    const usersToRemove = userIds.filter((userId) =>
      existingUsers.includes(userId),
    );

    if (usersToRemove.length === 0) {
      throw new BadRequestException(
        'Người dùng không phải là thành viên của nhóm.',
      );
    }

    conversation.users = conversation.users.filter(
      (user) => !usersToRemove.includes(user.id),
    );

    await this.removeConversationIfOnlyOneUser(conversation);

    return await this.conversationRepository.save(conversation);
  }

  async deleteConversation(id: string, adminId: string): Promise<void> {
    const conversation = await this.findConversationById(id, ['admin']);

    if (conversation.admin.id !== adminId) {
      throw new ForbiddenException(
        'Bạn không có quyền xóa cuộc trò chuyện này vì bạn không phải là admin.',
      );
    }

    await this.conversationRepository.remove(conversation);
  }

  async leaveGroup(conversationId: string, userId: string): Promise<void> {
    const conversation = await this.getConversationById(conversationId);
    conversation.users = conversation.users.filter((u) => u.id !== userId);

    if (conversation.users.length === 1) {
      await this.conversationRepository.remove(conversation);
    } else {
      await this.conversationRepository.save(conversation);
    }
  }
}
