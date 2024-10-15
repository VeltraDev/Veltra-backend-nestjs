import { Module } from '@nestjs/common';
import { UserConversationsService } from './user-conversations.service';
import { UserConversationsController } from './user-conversations.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserConversation } from './entities/user-conversation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserConversation])],
  controllers: [UserConversationsController],
  providers: [UserConversationsService],
  exports: [UserConversationsService],
})
export class UserConversationsModule {}
