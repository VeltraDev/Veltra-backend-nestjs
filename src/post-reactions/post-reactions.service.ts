import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PostReactionRecord } from './entities/post-reaction-record.entity';
import { Repository } from 'typeorm';
import { ReactionType } from 'src/reaction-types/entities/reaction-type.entity';
import { Post } from 'src/posts/entities/post.entity';
import { User } from 'src/users/entities/user.entity';
import { ErrorMessages } from 'src/exception/error-messages.enum';

@Injectable()
export class PostReactionsService {
  constructor(
    @InjectRepository(PostReactionRecord)
    private readonly postReactionRepository: Repository<PostReactionRecord>,
    @InjectRepository(ReactionType)
    private readonly reactionTypeRepository: Repository<ReactionType>,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async reactToPost(
    postId: string,
    reactionTypeId: string,
    userId: string,
  ): Promise<PostReactionRecord> {
    const post = await this.postRepository.findOne({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException(
        ErrorMessages.POST_NOT_FOUND.message.replace('{id}', postId),
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

    let reaction = await this.postReactionRepository.findOne({
      where: { reactedBy: { id: userId }, post: { id: postId } },
      relations: ['reactionType', 'reactedBy', 'post'],
    });

    if (reaction) {
      reaction.reactionType = reactionType;
      await this.postReactionRepository.save(reaction);
    } else {
      reaction = this.postReactionRepository.create({
        reactedBy: user,
        post,
        reactionType,
      });
      await this.postReactionRepository.save(reaction);
    }

    return await this.postReactionRepository.findOneOrFail({
      where: { id: reaction.id },
      relations: ['reactionType', 'reactedBy', 'post'],
    });
  }

  async removeReaction(postId: string, userId: string): Promise<void> {
    const post = await this.postRepository.findOne({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException(
        ErrorMessages.POST_NOT_FOUND.message.replace('{id}', postId),
      );
    }

    const reaction = await this.postReactionRepository.findOne({
      where: { reactedBy: { id: userId }, post: { id: postId } },
      relations: ['reactionType', 'reactedBy', 'post'],
    });

    if (!reaction) {
      throw new NotFoundException(
        ErrorMessages.POST_REACTION_RECORD_NOT_FOUND.message.replace(
          '{id}',
          postId,
        ),
      );
    }

    await this.postReactionRepository.remove(reaction);
  }
}
