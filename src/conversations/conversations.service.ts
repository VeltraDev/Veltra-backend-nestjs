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
import { ErrorMessages } from 'src/exception/error-messages.enum';

@Injectable()
export class ConversationsService {
  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
  ) {}

  private async validateUserInConversation(
    conversationId: string,
    userId: string,
  ): Promise<Conversation> {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
      relations: ['users', 'admin'],
    });

    if (!conversation) {
      throw new NotFoundException(
        ErrorMessages.CONVERSATION_NOT_FOUND.replace('{id}', conversationId),
      );
    }

    const isUserInConversation = conversation.users.some(
      (user) => user.id === userId,
    );
    if (!isUserInConversation) {
      throw new ForbiddenException(ErrorMessages.CONVERSATION_NO_ACCESS);
    }

    return conversation;
  }

  async getLatestMessage(
    conversationId: string,
    userId: string,
  ): Promise<Message> {
    const conversation = await this.validateUserInConversation(
      conversationId,
      userId,
    );

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
        ErrorMessages.CONVERSATION_NOT_FOUND.replace('{id}', id),
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
        ErrorMessages.CONVERSATION_USERS_NOT_FOUND.replace(
          '{missingUserIds}',
          missingUserIds.join(', '),
        ),
      );
    }

    return users;
  }

  async removeConversationIfOnlyOneUser(
    conversation: Conversation,
  ): Promise<void> {
    if (conversation.users.length === 1) {
      await this.conversationRepository.remove(conversation);
      throw new BadRequestException(ErrorMessages.CONVERSATION_ONLY_ONE_USER);
    }
  }

  async createConversation(
    user: UsersInterface,
    createConversationDto: CreateConversationDto,
  ): Promise<Conversation> {
    const { users } = createConversationDto;

    if (users.includes(user.id)) {
      throw new BadRequestException(
        ErrorMessages.CONVERSATION_CANNOT_CREATE_WITH_SELF,
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

  async getConversationById(id: string, userId: string): Promise<Conversation> {
    return await this.validateUserInConversation(id, userId);
  }

  async updateGroupInfo(
    id: string,
    updateInfoConversationDto: UpdateInfoConversationDto,
    userId: string,
  ): Promise<Conversation> {
    const conversation = await this.validateUserInConversation(id, userId);

    // Admin can update information of group
    // if (conversation.admin.id !== userId) {
    //   throw new ForbiddenException(ErrorMessages.CONVERSATION_ADMIN_FORBIDDEN);
    // }

    const { name, picture } = updateInfoConversationDto;

    if (name) conversation.name = name;
    if (picture) conversation.picture = picture;

    return await this.conversationRepository.save(conversation);
  }

  async updateGroupAdmin(
    id: string,
    adminId: string,
    userId: string,
  ): Promise<Conversation> {
    const conversation = await this.validateUserInConversation(id, userId);

    // Admin can change permission to add new group admin
    if (conversation.admin.id !== userId) {
      throw new ForbiddenException(ErrorMessages.CONVERSATION_ADMIN_FORBIDDEN);
    }

    if (!conversation.isGroup) {
      throw new BadRequestException(
        ErrorMessages.CONVERSATION_GROUP_CANNOT_UPDATE_ADMIN_1_1,
      );
    }

    const newAdmin = await this.userRepository.findOne({
      where: { id: adminId },
    });

    if (!newAdmin || !conversation.users.some((u) => u.id === adminId)) {
      throw new BadRequestException(ErrorMessages.CONVERSATION_ADMIN_NOT_VALID);
    }

    conversation.admin = newAdmin;
    return await this.conversationRepository.save(conversation);
  }

  async addUsersToGroup(
    id: string,
    userIds: string[],
    userId: string,
  ): Promise<Conversation> {
    const conversation = await this.validateUserInConversation(id, userId);

    if (conversation.admin.id !== userId) {
      throw new ForbiddenException(ErrorMessages.CONVERSATION_ADMIN_FORBIDDEN);
    }

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
        ErrorMessages.CONVERSATION_ALREADY_IN_GROUP.replace(
          '{alreadyInGroup}',
          alreadyInGroup.join(', '),
        ),
      );
    }

    if (alreadyInGroup.length > 0) {
      throw new BadRequestException(
        ErrorMessages.CONVERSATION_ALREADY_IN_GROUP_PARTIAL.replace(
          '{alreadyInGroup}',
          alreadyInGroup.join(', '),
        ),
      );
    }

    conversation.users.push(...newUsers);

    return await this.conversationRepository.save(conversation);
  }

  async removeUsersFromGroup(
    id: string,
    userIds: string[],
    userId: string,
  ): Promise<Conversation> {
    const conversation = await this.validateUserInConversation(id, userId);

    if (conversation.admin.id !== userId) {
      throw new ForbiddenException(ErrorMessages.CONVERSATION_ADMIN_FORBIDDEN);
    }

    if (!conversation.isGroup) {
      throw new NotFoundException(
        ErrorMessages.CONVERSATION_GROUP_REQUIRED.replace('{id}', id),
      );
    }

    const existingUsers = conversation.users.map((user) => user.id);
    const usersToRemove = userIds.filter((userId) =>
      existingUsers.includes(userId),
    );

    if (usersToRemove.length === 0) {
      throw new BadRequestException(
        ErrorMessages.CONVERSATION_USER_NOT_IN_GROUP,
      );
    }

    conversation.users = conversation.users.filter(
      (user) => !usersToRemove.includes(user.id),
    );

    await this.removeConversationIfOnlyOneUser(conversation);

    return await this.conversationRepository.save(conversation);
  }

  async deleteConversation(id: string, adminId: string): Promise<void> {
    const conversation = await this.validateUserInConversation(id, adminId);

    if (conversation.admin.id !== adminId) {
      throw new ForbiddenException(
        ErrorMessages.CONVERSATION_CANNOT_DELETE_ADMIN,
      );
    }

    await this.conversationRepository.remove(conversation);
  }

  async leaveGroup(conversationId: string, userId: string): Promise<void> {
    const conversation = await this.validateUserInConversation(
      conversationId,
      userId,
    );

    conversation.users = conversation.users.filter((u) => u.id !== userId);

    if (conversation.users.length === 1) {
      await this.conversationRepository.remove(conversation);
    } else {
      await this.conversationRepository.save(conversation);
    }
  }
}
