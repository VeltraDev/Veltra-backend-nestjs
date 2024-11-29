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
import { CommentsService } from 'src/comments/comments.service';
import { PostReactionRecord } from 'src/post-reactions/entities/post-reaction-record.entity';
import { CommentReactionRecord } from 'src/comment-reactions/entities/comment-reaction-record.entity';
import { Comment } from 'src/comments/entities/comment.entity';
import { UsersInterface } from 'src/users/users.interface';
import { User } from 'src/users/entities/user.entity';
import { Message } from 'src/messages/entities/message.entity';

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
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    private readonly commentsService: CommentsService,
  ) {
    super(postRepository);
  }

  async create(
    createPostDto: CreatePostDto,
    user: UsersInterface,
  ): Promise<Post> {
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
    user: UsersInterface,
  ): Promise<Post> {
    const post = await this.findOne(id);

    if (post.author.id !== user.id) {
      throw new BadRequestException(ErrorMessages.POST_NOT_OWNER.message);
    }

    Object.assign(post, updatePostDto);

    return this.postRepository.save(post);
  }

  async remove(id: string, user: UsersInterface): Promise<void> {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['author'],
    });

    if (!post) {
      throw new NotFoundException(
        ErrorMessages.POST_NOT_FOUND.message.replace('{id}', id),
      );
    }

    if (post.author.id !== user.id) {
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
        .where('parentId IS NOT NULL AND postId = :postId', { postId: id })
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

  // Dashboard admin (total)
  async getDashboardData(): Promise<any> {
    const totalPosts = await this.postRepository.count();
    const totalComments = await this.commentRepository.count();
    const totalUsers = await this.userRepository.count();
    const totalReactions = await this.postReactionRepository.count();

    const reactionsOverTime = await this.postReactionRepository
      .createQueryBuilder('reaction')
      .leftJoinAndSelect('reaction.reactionType', 'reactionType')
      .select("DATE_FORMAT(reaction.createdAt, '%Y-%m-%d') as date")
      .addSelect('reactionType.type', 'reactionType')
      .addSelect('COUNT(*) as count')
      .groupBy('date')
      .addGroupBy('reactionType.type')
      .orderBy('date', 'ASC')
      .getRawMany();

    const reactionRatePerPost =
      totalPosts > 0 ? totalReactions / totalPosts : 0;

    const postsOverTime = await this.postRepository
      .createQueryBuilder('post')
      .select("DATE_FORMAT(post.createdAt, '%Y-%m-%d') as date")
      .addSelect('COUNT(*) as count')
      .groupBy('date')
      .orderBy('date', 'ASC')
      .getRawMany();

    const commentsOverTime = await this.commentRepository
      .createQueryBuilder('comment')
      .select("DATE_FORMAT(comment.createdAt, '%Y-%m-%d') as date")
      .addSelect('COUNT(*) as count')
      .groupBy('date')
      .orderBy('date', 'ASC')
      .getRawMany();

    const messagesOverTime = await this.messageRepository
      .createQueryBuilder('message')
      .select("DATE_FORMAT(message.createdAt, '%H:00') as hour")
      .addSelect('COUNT(*) as count')
      .groupBy('hour')
      .orderBy('hour', 'ASC')
      .getRawMany();

    return {
      total: {
        posts: totalPosts,
        comments: totalComments,
        users: totalUsers,
        reactions: totalReactions,
      },
      charts: {
        reactionsOverTime,
        reactionRatePerPost,
        postsOverTime,
        commentsOverTime,
        messagesOverTime,
      },
    };
  }
}
