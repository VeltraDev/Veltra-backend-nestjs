import {
  Controller,
  Post as HttpPost,
  Get,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { MessageResponse } from 'src/common/decorators/message-response.decorator';
import { CreateCommentDto } from './dto/request/create-comment.dto';
import { UpdateCommentDto } from './dto/request/update-comment.dto';
import { plainToClass } from 'class-transformer';
import { CommentResponseDto } from './dto/response/comment-response.dto';
import { AuthUser } from 'src/common/decorators/auth-user.decorator';
import { User } from 'src/users/entities/user.entity';

@Controller('posts/:postId/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @MessageResponse('Tạo mới bình luận thành công')
  @HttpPost()
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

  @MessageResponse('Lấy danh sách bình luận thành công')
  @Get()
  async findCommentsByPost(@Param('postId') postId: string) {
    const comments = await this.commentsService.findCommentsByPost(postId);

    return comments.map((comment) =>
      plainToClass(CommentResponseDto, comment, {
        excludeExtraneousValues: true,
      }),
    );
  }

  @MessageResponse('Lấy thông tin bình luận thành công')
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const comment = await this.commentsService.findOne(id);

    return plainToClass(CommentResponseDto, comment, {
      excludeExtraneousValues: true,
    });
  }

  @MessageResponse('Cập nhật bình luận thành công')
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @AuthUser() user: User,
  ) {
    const comment = await this.commentsService.update(
      id,
      updateCommentDto,
      user.id,
    );

    return plainToClass(CommentResponseDto, comment, {
      excludeExtraneousValues: true,
    });
  }

  @MessageResponse('Xóa bình luận thành công')
  @Delete(':id')
  async remove(@Param('id') id: string, @AuthUser() user: User) {
    await this.commentsService.remove(id, user.id);
  }
}
