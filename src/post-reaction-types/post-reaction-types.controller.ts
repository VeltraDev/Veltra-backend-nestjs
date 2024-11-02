import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PostReactionTypesService } from './post-reaction-types.service';
import { MessageResponse } from 'src/common/decorators/message-response.decorator';
import { plainToClass } from 'class-transformer';
import { CreatePostReactionTypeDto } from './dto/request/create-post-reaction-type.dto';
import { PostReactionTypeResponseDto } from './dto/response/post-reaction-type-response.dto';
import { UpdatePostReactionTypeDto } from './dto/request/update-post-reaction-type.dto';

@Controller('post-reaction-types')
export class PostReactionTypesController {
  constructor(
    private readonly postReactionTypesService: PostReactionTypesService,
  ) {}

  @MessageResponse('Tạo mới loại phản ứng thành công')
  @Post()
  async create(@Body() createPostReactionTypeDto: CreatePostReactionTypeDto) {
    const reactionType = await this.postReactionTypesService.create(
      createPostReactionTypeDto,
    );
    return plainToClass(PostReactionTypeResponseDto, reactionType, {
      excludeExtraneousValues: true,
    });
  }

  @MessageResponse('Lấy danh sách loại phản ứng thành công')
  @Get()
  async findAll() {
    const reactionTypes = await this.postReactionTypesService.findAll();
    return reactionTypes.map((type) =>
      plainToClass(PostReactionTypeResponseDto, type, {
        excludeExtraneousValues: true,
      }),
    );
  }

  @MessageResponse('Lấy thông tin loại phản ứng thành công')
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const reactionType = await this.postReactionTypesService.findOne(id);
    return plainToClass(PostReactionTypeResponseDto, reactionType, {
      excludeExtraneousValues: true,
    });
  }

  @MessageResponse('Cập nhật loại phản ứng thành công')
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePostReactionTypeDto: UpdatePostReactionTypeDto,
  ) {
    const reactionType = await this.postReactionTypesService.update(
      id,
      updatePostReactionTypeDto,
    );
    return plainToClass(PostReactionTypeResponseDto, reactionType, {
      excludeExtraneousValues: true,
    });
  }

  @MessageResponse('Xóa loại phản ứng thành công')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.postReactionTypesService.remove(id);
  }
}
