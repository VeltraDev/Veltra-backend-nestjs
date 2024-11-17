import {
  Controller,
  Delete,
  Param,
  Body,
  Post as HttpPost,
} from '@nestjs/common';
import { PostReactionsService } from './post-reactions.service';
import { CreatePostReactionDto } from './dto/request/create-post-reaction.dto';
import { AuthUser } from 'src/common/decorators/auth-user.decorator';
import { User } from 'src/users/entities/user.entity';
import { MessageResponse } from 'src/common/decorators/message-response.decorator';
import { plainToClass } from 'class-transformer';
import { PostReactionResponseDto } from './dto/response/post-reaction-response.dto';

@Controller('posts/:id/reactions')
export class PostReactionsController {
  constructor(private readonly postReactionsService: PostReactionsService) {}

  @MessageResponse('Thả phản hồi cảm xúc vào bài viết thành công')
  @HttpPost()
  async reactToPost(
    @Param('id') id: string,
    @Body() createPostReactionDto: CreatePostReactionDto,
    @AuthUser() user: User,
  ) {
    const result = await this.postReactionsService.reactToPost(
      id,
      createPostReactionDto.reactionTypeId,
      user.id,
    );

    return plainToClass(PostReactionResponseDto, result, {
      excludeExtraneousValues: true,
    });
  }

  @MessageResponse('Xóa phản hồi cảm xúc khỏi bài viết thành công')
  @Delete()
  async removeReaction(@Param('id') id: string, @AuthUser() user: User) {
    await this.postReactionsService.removeReaction(id, user.id);
  }
}
