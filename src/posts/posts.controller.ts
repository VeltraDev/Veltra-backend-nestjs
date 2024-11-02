import {
  Controller,
  Get,
  Post as HttpPost,
  Body,
  Patch,
  Param,
  Delete,
  InternalServerErrorException,
  Query,
  UseGuards,
  Req,
  Post,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { MessageResponse } from 'src/common/decorators/message-response.decorator';
import { CreatePostDto } from './dto/request/create-post.dto';
import { UpdatePostDto } from './dto/request/update-post.dto';
import { plainToClass } from 'class-transformer';
import { PaginatedPostsDto } from './dto/response/paginate-posts-response.dto';
import { PostResponseDto } from './dto/response/post-response.dto';
import { FilterPostsDto } from './dto/request/filter-posts.dto';
import { ErrorMessages } from 'src/exception/error-messages.enum';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { AuthUser } from 'src/common/decorators/auth-user.decorator';
import { UsersInterface } from 'src/users/users.interface';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @MessageResponse('Tạo mới bài viết thành công')
  @Post()
  async create(
    @Body() createPostDto: CreatePostDto,
    @AuthUser() user: UsersInterface,
  ) {
    const post = await this.postsService.create(createPostDto, user);

    return plainToClass(PostResponseDto, post, {
      excludeExtraneousValues: true,
    });
  }

  @MessageResponse(
    'Lấy danh sách tất cả bài viết với truy vấn thành công',
  )
  @Get()
  async getAllPosts(@Query() query: FilterPostsDto) {
    try {
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
    } catch (error) {
      throw new InternalServerErrorException(ErrorMessages.FETCH_POSTS_FAILED);
    }
  }

  @MessageResponse('Lấy thông tin bài viết thành công')
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return plainToClass(PostResponseDto, await this.postsService.findOne(id), {
      excludeExtraneousValues: true,
    });
  }

  @MessageResponse('Cập nhật bài viết thành công')
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
    @Req() req: Request,
  ) {
    const user = req.user as any;
    const post = await this.postsService.update(id, updatePostDto, user.id);

    return plainToClass(PostResponseDto, post, {
      excludeExtraneousValues: true,
    });
  }

  @MessageResponse('Xóa bài viết thành công')
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as any;
    await this.postsService.remove(id, user.id);
  }
}
