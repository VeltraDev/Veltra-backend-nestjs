import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommentReactionRecord } from './entities/comment-reaction-record.entity';
import { Repository } from 'typeorm';
import { ReactionType } from 'src/reaction-types/entities/reaction-type.entity';
import { Comment } from 'src/comments/entities/comment.entity';
import { User } from 'src/users/entities/user.entity';
import { ErrorMessages } from 'src/exception/error-messages.enum';

@Injectable()
export class CommentReactionsService {
  constructor(
    @InjectRepository(CommentReactionRecord)
    private readonly commentReactionRepository: Repository<CommentReactionRecord>,
    @InjectRepository(ReactionType)
    private readonly reactionTypeRepository: Repository<ReactionType>,
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async reactToComment(
    commentId: string,
    reactionTypeId: string,
    userId: string,
  ): Promise<CommentReactionRecord | null> {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
    });
    if (!comment) {
      throw new NotFoundException(
        ErrorMessages.COMMENT_NOT_FOUND.message.replace('{id}', commentId),
      );
    }

    const reactionType = await this.reactionTypeRepository.findOne({
      where: { id: reactionTypeId },
    });
    if (!reactionType) {
      throw new NotFoundException(
        ErrorMessages.REACTION_TYPE_NOT_FOUND.message.replace(
          '{id}',
          reactionTypeId,
        ),
      );
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(
        ErrorMessages.USER_NOT_FOUND_ID.message.replace('{id}', userId),
      );
    }

    const existingReaction = await this.commentReactionRepository.findOne({
      where: { reactedBy: { id: userId }, comment: { id: commentId } },
      relations: ['reactionType', 'reactedBy', 'comment'],
    });

    if (existingReaction) {
      if (existingReaction.reactionType.id === reactionTypeId) {
        await this.commentReactionRepository.remove(existingReaction);
        return null;
      } else {
        existingReaction.reactionType = reactionType;
        return await this.commentReactionRepository.save(existingReaction);
      }
    } else {
      const newReaction = this.commentReactionRepository.create({
        reactedBy: user,
        comment,
        reactionType,
      });
      return await this.commentReactionRepository.save(newReaction);
    }
  }

  async removeReaction(commentId: string, userId: string): Promise<void> {
    const reaction = await this.commentReactionRepository.findOne({
      where: { reactedBy: { id: userId }, comment: { id: commentId } },
    });

    if (!reaction) {
      throw new NotFoundException(
        ErrorMessages.REACTION_RECORD_NOT_FOUND.message,
      );
    }

    await this.commentReactionRepository.remove(reaction);
  }
}
