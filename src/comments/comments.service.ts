import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Comment } from './entities/comment.entity';
import { In, Repository, TreeRepository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateCommentDto } from './dto/request/create-comment.dto';
import { UpdateCommentDto } from './dto/request/update-comment.dto';
import { Post } from 'src/posts/entities/post.entity';
import { ErrorMessages } from 'src/exception/error-messages.enum';
import { User } from 'src/users/entities/user.entity';
import { CommentReactionRecord } from 'src/comment-reactions/entities/comment-reaction-record.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: TreeRepository<Comment>,
    @InjectRepository(CommentReactionRecord)
    private readonly commentReactionRepository: Repository<CommentReactionRecord>,
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
        where: {
          id: createCommentDto.parentId,
          post: { id: postId },
        },
      });

      if (!parentComment) {
        throw new NotFoundException(
          ErrorMessages.COMMENT_NOT_FOUND_IN_POST.message.replace(
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

    const allComments = await this.commentRepository.find({
      where: { post: { id: comment.post?.id } },
      relations: [
        'author',
        'reactions',
        'reactions.reactedBy',
        'reactions.reactionType',
        'parent',
      ],
      order: { createdAt: 'ASC' },
    });

    const tree = this.buildCommentTree(allComments);

    const rootComment = tree.find((c) => c.id === comment.id);
    return rootComment || comment;
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
        'parent',
      ],
      order: { createdAt: 'ASC' },
    });

    return this.buildCommentTree(comments);
  }

  async update(
    id: string,
    updateCommentDto: UpdateCommentDto,
    userId: string,
  ): Promise<Comment> {
    const comment = await this.findOne(id);

    if (comment.author.id !== userId)
      throw new BadRequestException(ErrorMessages.COMMENT_NOT_OWNER.message);

    Object.assign(comment, updateCommentDto);

    return this.commentRepository.save(comment);
  }

  async remove(id: string, userId: string): Promise<void> {
    const comment = await this.commentRepository.findOne({
      where: { id },
      relations: ['author'],
    });

    if (!comment) {
      throw new NotFoundException(
        ErrorMessages.COMMENT_NOT_FOUND.message.replace('{id}', id),
      );
    }

    if (comment.author.id !== userId) {
      throw new BadRequestException(ErrorMessages.COMMENT_NOT_OWNER.message);
    }

    const rawDescendants = await this.commentRepository.query(
      `
    WITH RECURSIVE descendants AS (
      SELECT id
      FROM comment
      WHERE id = ?
      UNION ALL
      SELECT c.id
      FROM comment c
      INNER JOIN descendants d ON c.parentId = d.id
    )
    SELECT id FROM descendants;
    `,
      [id],
    );

    const commentIds = rawDescendants.map((record) => record.id);
    if (commentIds.length === 0)
      throw new BadRequestException(ErrorMessages.COMMENT_DATA_INVALID.message);

    for (const commentId of commentIds) {
      await this.commentReactionRepository
        .createQueryBuilder()
        .delete()
        .from(CommentReactionRecord)
        .where('commentId = :commentId', { commentId })
        .execute();
    }

    for (const commentId of [...commentIds].reverse()) {
      await this.commentRepository
        .createQueryBuilder()
        .delete()
        .from(Comment)
        .where('id = :commentId', { commentId })
        .execute();
    }
  }

  private buildCommentTree(comments: Comment[]): Comment[] {
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
