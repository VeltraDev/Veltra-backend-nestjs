import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { ConversationsModule } from 'src/conversations/conversations.module';
import { User } from 'src/users/entities/user.entity';
import { MessageForward } from './entities/message-forward.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Message, User, MessageForward]),
    ConversationsModule,
  ],
  controllers: [MessagesController],
  providers: [MessagesService],
  exports: [MessagesService],
})
export class MessagesModule {}
