import { Controller, Delete, Param, Body, Post } from '@nestjs/common';
import { PostReactionsService } from './post-reactions.service';
import { CreatePostReactionDto } from './dto/request/create-post-reaction.dto';
import { AuthUser } from 'src/common/decorators/auth-user.decorator';
import { UsersInterface } from 'src/users/users.interface';
import { MessageResponse } from 'src/common/decorators/message-response.decorator';

@Controller('posts/:postId/reactions')
export class PostReactionsController {
  constructor(private readonly postReactionsService: PostReactionsService) {}

  @MessageResponse('Thả phản hồi cảm xúc vào bài viết thành công')
  @Post()
  async reactToPost(
    @Param('postId') postId: string,
    @Body() createPostReactionDto: CreatePostReactionDto,
    @AuthUser() user: UsersInterface,
  ) {
    await this.postReactionsService.reactToPost(
      postId,
      createPostReactionDto.reactionTypeId,
      user,
    );
  }

  @MessageResponse('Xóa phản hồi cảm xúc khỏi bài viết thành công')
  @Delete()
  async removeReaction(
    @Param('postId') postId: string,
    @AuthUser() user: UsersInterface,
  ) {
    await this.postReactionsService.removeReaction(postId, user.id);
  }
}
