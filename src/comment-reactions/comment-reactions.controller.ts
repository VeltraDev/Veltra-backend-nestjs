import { Controller, Delete, Param, Body, Post } from '@nestjs/common';
import { CommentReactionsService } from './comment-reactions.service';
import { AuthUser } from 'src/common/decorators/auth-user.decorator';
import { User } from 'src/users/entities/user.entity';
import { MessageResponse } from 'src/common/decorators/message-response.decorator';
import { plainToClass } from 'class-transformer';
import { CommentReactionResponseDto } from './dto/response/comment-reaction-response.dto';
import { CreateCommentReactionDto } from './dto/request/create-comment-reaction.dto';

@Controller('comments/:id/reactions')
export class CommentReactionsController {
  constructor(
    private readonly commentReactionsService: CommentReactionsService,
  ) {}

  @MessageResponse('Thả phản hồi cảm xúc vào bình luận thành công')
  @Post()
  async reactToComment(
    @Param('id') id: string,
    @Body() createCommentReactionDto: CreateCommentReactionDto,
    @AuthUser() user: User,
  ) {
    const result = await this.commentReactionsService.reactToComment(
      id,
      createCommentReactionDto.reactionTypeId,
      user.id,
    );

    return plainToClass(CommentReactionResponseDto, result, {
      excludeExtraneousValues: true,
    });
  }

  @MessageResponse('Xóa phản hồi cảm xúc khỏi bình luận thành công')
  @Delete()
  async removeReaction(@Param('id') id: string, @AuthUser() user: User) {
    await this.commentReactionsService.removeReaction(id, user.id);
  }
}
