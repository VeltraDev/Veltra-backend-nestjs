import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UserConversationsService } from './user-conversations.service';
import { CreateUserConversationDto } from './dto/create-user-conversation.dto';
import { UpdateUserConversationDto } from './dto/update-user-conversation.dto';

@Controller('user-conversations')
export class UserConversationsController {
  constructor(private readonly userConversationsService: UserConversationsService) {}

  @Post()
  create(@Body() createUserConversationDto: CreateUserConversationDto) {
    return this.userConversationsService.create(createUserConversationDto);
  }

  @Get()
  findAll() {
    return this.userConversationsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userConversationsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserConversationDto: UpdateUserConversationDto) {
    return this.userConversationsService.update(+id, updateUserConversationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userConversationsService.remove(+id);
  }
}
