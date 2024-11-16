import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Post } from './entities/post.entity';
import { ErrorMessages } from 'src/exception/error-messages.enum';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreatePostDto } from './dto/request/create-post.dto';
import { UpdatePostDto } from './dto/request/update-post.dto';
import { FilterPostsDto } from './dto/request/filter-posts.dto';
import { BaseService } from 'src/base/base.service';
import { UsersInterface } from 'src/users/users.interface';

@Injectable()
export class PostsService extends BaseService<Post> {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
  ) {
    super(postRepository);
  }

  async create(
    createPostDto: CreatePostDto,
    user: UsersInterface,
  ): Promise<Post> {
    const post = this.postRepository.create({
      ...createPostDto,
      user,
    });
    return this.postRepository.save(post);
  }

  async getAllPosts(query: FilterPostsDto) {
    const validSortFields = ['content', 'createdAt'];
    return this.getAll(query, validSortFields, 'post');
  }

  async findOne(id: string): Promise<Post> {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: [
        'user',
        'postReactions',
        'postReactions.user',
        'postReactions.reactionType',
      ],
    });
    if (!post) {
      throw new NotFoundException(
        ErrorMessages.POST_NOT_FOUND.message.replace('{id}', id),
      );
    }
    return post;
  }

  async update(
    id: string,
    updatePostDto: UpdatePostDto,
    userId: string,
  ): Promise<Post> {
    const post = await this.findOne(id);

    if (post.user.id !== userId)
      throw new BadRequestException(ErrorMessages.POST_NOT_OWNER.message);

    Object.assign(post, updatePostDto);

    return this.postRepository.save(post);
  }

  async remove(id: string, userId: string): Promise<void> {
    const post = await this.findOne(id);

    if (post.user.id !== userId)
      throw new BadRequestException(ErrorMessages.POST_NOT_OWNER.message);

    await this.postRepository.remove(post);
  }
}
