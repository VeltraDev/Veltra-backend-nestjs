import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PostReactionRecord } from './entities/post-reaction-record.entity';
import { Repository } from 'typeorm';
import { ReactionType } from 'src/reaction-types/entities/reaction-type.entity';
import { Post } from 'src/posts/entities/post.entity';
import { UsersInterface } from 'src/users/users.interface';
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
  ) {}

  private async validatePost(postId: string): Promise<Post> {
    const post = await this.postRepository.findOne({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException(
        ErrorMessages.POST_NOT_FOUND.message.replace('{id}', postId),
      );
    }
    return post;
  }

  async reactToPost(
    postId: string,
    reactionTypeId: string,
    user: UsersInterface,
  ): Promise<PostReactionRecord> {
    const post = await this.validatePost(postId);

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

    let reaction = await this.postReactionRepository.findOne({
      where: { user: { id: user.id }, post: { id: postId } },
      relations: ['reactionType', 'user', 'post', 'post.user'],
    });

    if (reaction) {
      reaction.reactionType = reactionType;
      await this.postReactionRepository.save(reaction);
    } else {
      reaction = this.postReactionRepository.create({
        user,
        post,
        reactionType,
      });
      await this.postReactionRepository.save(reaction);
    }

    return await this.postReactionRepository.findOneOrFail({
      where: { id: reaction.id },
      relations: ['reactionType', 'user', 'post', 'post.user'],
    });
  }

  async removeReaction(postId: string, userId: string): Promise<void> {
    await this.validatePost(postId);

    const reaction = await this.postReactionRepository.findOne({
      where: { user: { id: userId }, post: { id: postId } },
    });

    if (!reaction) {
      throw new NotFoundException(
        ErrorMessages.REACTION_RECORD_NOT_FOUND.message,
      );
    }

    await this.postReactionRepository.remove(reaction);
  }
}
