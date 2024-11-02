import {
  Controller,
  Post as HttpPost,
  Body,
  Param,
  Delete,
  Get,
  UseGuards,
  Req,
} from '@nestjs/common';
import { PostReactionRecordsService } from './post-reaction-records.service';
import { MessageResponse } from 'src/common/decorators/message-response.decorator';
import { plainToClass } from 'class-transformer';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { CreatePostReactionRecordDto } from './dto/request/create-post-reaction-record.dto';
import { PostReactionRecordResponseDto } from './dto/response/post-reaction-record-response.dto';

@Controller('post-reaction-records')
export class PostReactionRecordsController {
  constructor(
    private readonly postReactionRecordsService: PostReactionRecordsService,
  ) {}

  @MessageResponse('Tạo mới phản ứng cho bài viết thành công')
  @UseGuards(JwtAuthGuard)
  @HttpPost()
  async create(
    @Body() createPostReactionRecordDto: CreatePostReactionRecordDto,
    @Req() req: Request,
  ) {
    const user = req.user as any;
    const reactionRecord = await this.postReactionRecordsService.create(
      createPostReactionRecordDto,
      user.id,
    );

    return plainToClass(PostReactionRecordResponseDto, reactionRecord, {
      excludeExtraneousValues: true,
    });
  }

  @MessageResponse('Lấy danh sách phản ứng của bài viết thành công')
  @Get('post/:postId')
  async findAllByPost(@Param('postId') postId: string) {
    const reactionRecords =
      await this.postReactionRecordsService.findAllByPost(postId);

    return reactionRecords.map((record) =>
      plainToClass(PostReactionRecordResponseDto, record, {
        excludeExtraneousValues: true,
      }),
    );
  }

  @MessageResponse('Xóa phản ứng bài viết thành công')
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as any;
    await this.postReactionRecordsService.remove(id, user.id);
  }
}
