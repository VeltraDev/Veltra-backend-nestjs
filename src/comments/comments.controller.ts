import { Controller, Get, Patch, Delete, Param, Body } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { MessageResponse } from 'src/common/decorators/message-response.decorator';
import { UpdateCommentDto } from './dto/request/update-comment.dto';
import { plainToClass } from 'class-transformer';
import { CommentResponseDto } from './dto/response/comment-response.dto';
import { AuthUser } from 'src/common/decorators/auth-user.decorator';
import { User } from 'src/users/entities/user.entity';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @MessageResponse('Lấy thông tin của một bình luận thành công')
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
