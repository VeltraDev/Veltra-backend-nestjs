import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Post } from './entities/post.entity';
import { ErrorMessages } from 'src/exception/error-messages.enum';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreatePostDto } from './dto/request/create-post.dto';
import { UpdatePostDto } from './dto/request/update-post.dto';
import { FilterPostsDto } from './dto/request/filter-posts.dto';
import { BaseService } from 'src/base/base.service';
import { User } from 'src/users/entities/user.entity';
import { CommentsService } from 'src/comments/comments.service';
import { PostReactionRecord } from 'src/post-reactions/entities/post-reaction-record.entity';
import { CommentReactionRecord } from 'src/comment-reactions/entities/comment-reaction-record.entity';
import { Comment } from 'src/comments/entities/comment.entity';

@Injectable()
export class PostsService extends BaseService<Post> {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(PostReactionRecord)
    private readonly postReactionRepository: Repository<PostReactionRecord>,
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(CommentReactionRecord)
    private readonly commentReactionRepository: Repository<CommentReactionRecord>,
    private readonly commentsService: CommentsService,
  ) {
    super(postRepository);
  }

  async create(createPostDto: CreatePostDto, user: User): Promise<Post> {
    const post = this.postRepository.create({
      ...createPostDto,
      author: user,
    });
    return this.postRepository.save(post);
  }

  async getAllPosts(query: FilterPostsDto) {
    const validSortFields = ['content', 'createdAt'];
    return this.getAll(query, validSortFields, 'post', [
      'author',
      'reactions',
      'reactions.reactedBy',
      'reactions.reactionType',
    ]);
  }

  async findOne(id: string): Promise<Post> {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: [
        'author',
        'reactions',
        'reactions.reactedBy',
        'reactions.reactionType',
      ],
    });
    if (!post) {
      throw new NotFoundException(
        ErrorMessages.POST_NOT_FOUND.message.replace('{id}', id),
      );
    }

    const comments = await this.commentsService.findCommentsByPost(id);
    post.comments = comments;

    return post;
  }

  async update(
    id: string,
    updatePostDto: UpdatePostDto,
    userId: string,
  ): Promise<Post> {
    const post = await this.findOne(id);

    if (post.author.id !== userId) {
      throw new BadRequestException(ErrorMessages.POST_NOT_OWNER.message);
    }

    Object.assign(post, updatePostDto);

    return this.postRepository.save(post);
  }

  async remove(id: string, userId: string): Promise<void> {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['author'],
    });

    if (!post) {
      throw new NotFoundException(
        ErrorMessages.POST_NOT_FOUND.message.replace('{id}', id),
      );
    }

    if (post.author.id !== userId) {
      throw new BadRequestException(ErrorMessages.POST_NOT_OWNER.message);
    }

    await this.postReactionRepository
      .createQueryBuilder()
      .delete()
      .from(PostReactionRecord)
      .where('postId = :postId', { postId: id })
      .execute();

    const comments = await this.commentRepository
      .createQueryBuilder('comment')
      .select('comment.id')
      .where('comment.postId = :postId', { postId: id })
      .getRawMany();

    const commentIds = comments.map((comment) => comment.comment_id);

    if (commentIds.length > 0) {
      await this.commentReactionRepository
        .createQueryBuilder()
        .delete()
        .from(CommentReactionRecord)
        .where('commentId IN (:...commentIds)', { commentIds })
        .execute();

      await this.commentRepository
        .createQueryBuilder()
        .delete()
        .from(Comment)
        .where('postId = :postId', { postId: id })
        .execute();
    }

    await this.postRepository.remove(post);
  }
}
