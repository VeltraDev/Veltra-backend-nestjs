import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Comment } from './entities/comment.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateCommentDto } from './dto/request/create-comment.dto';
import { UpdateCommentDto } from './dto/request/update-comment.dto';
import { Post } from 'src/posts/entities/post.entity';
import { ErrorMessages } from 'src/exception/error-messages.enum';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
  ) {}

  async create(
    postId: string,
    createCommentDto: CreateCommentDto,
    user: User,
  ): Promise<Comment> {
    const post = await this.postRepository.findOne({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException(
        ErrorMessages.POST_NOT_FOUND.message.replace('{id}', postId),
      );
    }

    const comment = this.commentRepository.create({
      content: createCommentDto.content,
      post,
      author: user,
    });

    if (createCommentDto.parentId) {
      const parentComment = await this.commentRepository.findOne({
        where: { id: createCommentDto.parentId },
      });
      if (!parentComment) {
        throw new NotFoundException(
          ErrorMessages.COMMENT_NOT_FOUND.message.replace(
            '{id}',
            createCommentDto.parentId,
          ),
        );
      }
      comment.parent = parentComment;
    }

    return this.commentRepository.save(comment);
  }

  async findOne(id: string): Promise<Comment> {
    const comment = await this.commentRepository.findOne({
      where: { id },
      relations: [
        'author',
        'children',
        'reactions',
        'reactions.reactedBy',
        'reactions.reactionType',
      ],
    });
    if (!comment) {
      throw new NotFoundException(
        ErrorMessages.COMMENT_NOT_FOUND.message.replace('{id}', id),
      );
    }
    return comment;
  }

  async update(
    id: string,
    updateCommentDto: UpdateCommentDto,
    userId: string,
  ): Promise<Comment> {
    const comment = await this.findOne(id);

    if (comment.author.id !== userId) {
      throw new BadRequestException(ErrorMessages.COMMENT_NOT_OWNER.message);
    }

    Object.assign(comment, updateCommentDto);

    return this.commentRepository.save(comment);
  }

  async remove(id: string, userId: string): Promise<void> {
    const comment = await this.findOne(id);

    if (comment.author.id !== userId) {
      throw new BadRequestException(ErrorMessages.COMMENT_NOT_OWNER.message);
    }

    await this.commentRepository.remove(comment);
  }

  async findCommentsByPost(postId: string): Promise<Comment[]> {
    const post = await this.postRepository.findOne({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException(
        ErrorMessages.POST_NOT_FOUND.message.replace('{id}', postId),
      );
    }

    const comments = await this.commentRepository.find({
      where: { post: { id: postId } },
      relations: [
        'author',
        'reactions',
        'reactions.reactedBy',
        'reactions.reactionType',
        'children',
      ],
      order: { createdAt: 'ASC' },
    });

    const commentMap = new Map<string, Comment>();
    comments.forEach((comment) => commentMap.set(comment.id, comment));

    const rootComments: Comment[] = [];
    comments.forEach((comment) => {
      if (comment.parent?.id) {
        const parentComment = commentMap.get(comment.parent.id);
        if (parentComment) {
          parentComment.children = parentComment.children || [];
          parentComment.children.push(comment);
        }
      } else {
        rootComments.push(comment);
      }
    });

    return rootComments;
  }
}
