import { WebSocketGateway, SubscribeMessage, MessageBody } from '@nestjs/websockets';
import { ConversationsService } from './conversations.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';

@WebSocketGateway()
export class ConversationsGateway {
  constructor(private readonly conversationsService: ConversationsService) {}

  @SubscribeMessage('createConversation')
  create(@MessageBody() createConversationDto: CreateConversationDto) {
    return this.conversationsService.create(createConversationDto);
  }

  @SubscribeMessage('findAllConversations')
  findAll() {
    return this.conversationsService.findAll();
  }

  @SubscribeMessage('findOneConversation')
  findOne(@MessageBody() id: number) {
    return this.conversationsService.findOne(id);
  }

  @SubscribeMessage('updateConversation')
  update(@MessageBody() updateConversationDto: UpdateConversationDto) {
    return this.conversationsService.update(updateConversationDto.id, updateConversationDto);
  }

  @SubscribeMessage('removeConversation')
  remove(@MessageBody() id: number) {
    return this.conversationsService.remove(id);
  }
}
