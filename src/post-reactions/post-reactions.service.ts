import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PostReactionRecord } from './entities/post-reaction-record.entity';
import { Repository } from 'typeorm';
import { ReactionType } from 'src/reaction-types/entities/reaction-type.entity';
import { Post } from 'src/posts/entities/post.entity';
import { UsersInterface } from 'src/users/users.interface';

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

  async reactToPost(
    postId: string,
    reactionTypeId: string,
    user: UsersInterface,
  ): Promise<void> {
    const post = await this.postRepository.findOne({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException(`Không tìm thấy bài viết với ID ${postId}`);
    }

    const reactionType = await this.reactionTypeRepository.findOne({
      where: { id: reactionTypeId },
    });
    if (!reactionType) {
      throw new NotFoundException(
        `Không tìm thấy loại phản hồi với ID ${reactionTypeId}`,
      );
    }

    const existingReaction = await this.postReactionRepository.findOne({
      where: { user: { id: user.id }, post: { id: postId } },
      relations: ['reactionType'],
    });

    if (existingReaction) {
      if (existingReaction.reactionType.id === reactionTypeId) await this.postReactionRepository.remove(existingReaction);
      else {
        existingReaction.reactionType = reactionType;
        await this.postReactionRepository.save(existingReaction);
      }
    } else {
      const newReaction = this.postReactionRepository.create({
        user,
        post,
        reactionType,
      });

      await this.postReactionRepository.save(newReaction);
    }
  }

  async removeReaction(postId: string, userId: string): Promise<void> {
    const reaction = await this.postReactionRepository.findOne({
      where: { user: { id: userId }, post: { id: postId } },
    });

    if (!reaction) {
      throw new NotFoundException('Không tìm thấy phản hồi để xóa');
    }

    await this.postReactionRepository.remove(reaction);
  }
}
