import { Module } from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { ConversationsGateway } from './conversations.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Conversation } from './entities/conversation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Conversation])],
  providers: [ConversationsGateway, ConversationsService],
  exports: [ConversationsService],
})
export class ConversationsModule {}
