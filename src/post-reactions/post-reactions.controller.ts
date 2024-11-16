import { Controller, Delete, Param, Body, Post } from '@nestjs/common';
import { PostReactionsService } from './post-reactions.service';
import { CreatePostReactionDto } from './dto/request/create-post-reaction.dto';
import { AuthUser } from 'src/common/decorators/auth-user.decorator';
import { UsersInterface } from 'src/users/users.interface';
import { MessageResponse } from 'src/common/decorators/message-response.decorator';
import { plainToClass } from 'class-transformer';
import { ReactionResponseDto } from './dto/response/reaction-response.dto';

@Controller('posts/:id/reactions')
export class PostReactionsController {
  constructor(private readonly postReactionsService: PostReactionsService) {}

  @MessageResponse('Thả phản hồi cảm xúc vào bài viết thành công')
  @Post()
  async reactToPost(
    @Param('id') id: string,
    @Body() createPostReactionDto: CreatePostReactionDto,
    @AuthUser() user: UsersInterface,
  ) {
    const result = await this.postReactionsService.reactToPost(
      id,
      createPostReactionDto.reactionTypeId,
      user,
    );

    return plainToClass(
      ReactionResponseDto,
      {
        id: result.id,
        userReactToPost: result.user,
        post: result.post,
        reactionType: result.reactionType,
      },
      {
        excludeExtraneousValues: true,
      },
    );
  }

  @MessageResponse('Xóa phản hồi cảm xúc khỏi bài viết thành công')
  @Delete()
  async removeReaction(
    @Param('id') id: string,
    @AuthUser() user: UsersInterface,
  ) {
    return await this.postReactionsService.removeReaction(id, user.id);
  }
}
