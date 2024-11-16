import {
  Controller,
  Post as HttpPost,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { CommentReactionsService } from './comment-reactions.service';
import { AuthUser } from 'src/common/decorators/auth-user.decorator';
import { UsersInterface } from 'src/users/users.interface';
import { MessageResponse } from 'src/common/decorators/message-response.decorator';
import { plainToClass } from 'class-transformer';
import { CommentReactionResponseDto } from './dto/response/comment-reaction-response.dto';
import { CreateCommentReactionDto } from './dto/request/create-comment-reaction.dto';

@Controller('comments/:id/reactions')
export class CommentReactionsController {
  constructor(
    private readonly commentReactionsService: CommentReactionsService,
  ) {}

  @MessageResponse('Thao tác phản hồi cảm xúc vào bình luận thành công')
  @HttpPost()
  async reactToComment(
    @Param('id') id: string,
    @Body() createCommentReactionDto: CreateCommentReactionDto,
    @AuthUser() user: UsersInterface,
  ) {
    const result = await this.commentReactionsService.reactToComment(
      id,
      createCommentReactionDto.reactionTypeId,
      user,
    );

    if (result) {
      return plainToClass(CommentReactionResponseDto, result, {
        excludeExtraneousValues: true,
      });
    } else {
      return { message: 'Đã xóa phản hồi cảm xúc của bạn khỏi bình luận' };
    }
  }

  @MessageResponse('Xóa phản hồi cảm xúc khỏi bình luận thành công')
  @Delete()
  async removeReaction(
    @Param('id') id: string,
    @AuthUser() user: UsersInterface,
  ) {
    await this.commentReactionsService.removeReaction(id, user.id);
  }
}
