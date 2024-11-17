import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { MessageResponse } from 'src/common/decorators/message-response.decorator';
import { CreateCommentDto } from './dto/request/create-comment.dto';
import { plainToClass } from 'class-transformer';
import { CommentResponseDto } from './dto/response/comment-response.dto';
import { AuthUser } from 'src/common/decorators/auth-user.decorator';
import { User } from 'src/users/entities/user.entity';

@Controller('posts/:postId/comments')
export class PostCommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @MessageResponse('Tạo mới bình luận thành công')
  @Post()
  async create(
    @Param('postId') postId: string,
    @Body() createCommentDto: CreateCommentDto,
    @AuthUser() user: User,
  ) {
    const comment = await this.commentsService.create(
      postId,
      createCommentDto,
      user,
    );

    return plainToClass(CommentResponseDto, comment, {
      excludeExtraneousValues: true,
    });
  }

  @MessageResponse('Lấy danh sách bình luận của một bài viết thành công')
  @Get()
  async findCommentsByPost(@Param('postId') postId: string) {
    const comments = await this.commentsService.findCommentsByPost(postId);

    return comments.map((comment) =>
      plainToClass(CommentResponseDto, comment, {
        excludeExtraneousValues: true,
      }),
    );
  }
}
