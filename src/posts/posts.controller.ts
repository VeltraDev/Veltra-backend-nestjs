import {
  Controller,
  Get,
  Post as HttpPost,
  Patch,
  Delete,
  Param,
  Query,
  Body,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { MessageResponse } from 'src/common/decorators/message-response.decorator';
import { CreatePostDto } from './dto/request/create-post.dto';
import { UpdatePostDto } from './dto/request/update-post.dto';
import { FilterPostsDto } from './dto/request/filter-posts.dto';
import { plainToClass } from 'class-transformer';
import { PaginatedPostsDto } from './dto/response/paginate-posts-response.dto';
import { PostResponseDto } from './dto/response/post-response.dto';
import { AuthUser } from 'src/common/decorators/auth-user.decorator';
import { User } from 'src/users/entities/user.entity';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @MessageResponse('Tạo bài viết thành công')
  @HttpPost()
  async create(@Body() createPostDto: CreatePostDto, @AuthUser() user: User) {
    const post = await this.postsService.create(createPostDto, user);

    return plainToClass(PostResponseDto, post, {
      excludeExtraneousValues: true,
    });
  }

  @MessageResponse('Lấy danh sách bài viết thành công')
  @Get()
  async getAllPosts(@Query() query: FilterPostsDto) {
    const paginatedPosts = await this.postsService.getAllPosts(query);

    const results = paginatedPosts.results.map((post) =>
      plainToClass(PostResponseDto, post, {
        excludeExtraneousValues: true,
      }),
    );

    return plainToClass(PaginatedPostsDto, {
      total: paginatedPosts.total,
      page: paginatedPosts.page,
      limit: paginatedPosts.limit,
      results,
    });
  }

  @MessageResponse('Lấy thông tin bài viết thành công')
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const post = await this.postsService.findOne(id);

    return plainToClass(PostResponseDto, post, {
      excludeExtraneousValues: true,
    });
  }

  @MessageResponse('Cập nhật bài viết thành công')
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
    @AuthUser() user: User,
  ) {
    const post = await this.postsService.update(id, updatePostDto, user.id);

    return plainToClass(PostResponseDto, post, {
      excludeExtraneousValues: true,
    });
  }

  @MessageResponse('Xóa bài viết thành công')
  @Delete(':id')
  async remove(@Param('id') id: string, @AuthUser() user: User) {
    await this.postsService.remove(id, user.id);
  }
}
