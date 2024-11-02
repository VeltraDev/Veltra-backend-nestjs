import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PostReactionRecord } from './entities/post-reaction-record.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ErrorMessages } from 'src/exception/error-messages.enum';
import { User } from 'src/users/entities/user.entity';
import { Post } from 'src/posts/entities/post.entity';
import { PostReactionType } from 'src/post-reaction-types/entities/post-reaction-type.entity';
import { BaseService } from 'src/base/base.service';
import { CreatePostReactionRecordDto } from './dto/request/create-post-reaction-record.dto';

@Injectable()
export class PostReactionRecordsService extends BaseService<PostReactionRecord> {
  constructor(
    @InjectRepository(PostReactionRecord)
    private readonly postReactionRecordRepository: Repository<PostReactionRecord>,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(PostReactionType)
    private readonly postReactionTypeRepository: Repository<PostReactionType>,
  ) {
    super(postReactionRecordRepository);
  }

  async create(
    createPostReactionRecordDto: CreatePostReactionRecordDto,
    userId: string,
  ): Promise<PostReactionRecord> {
    const { postId, reactionTypeId } = createPostReactionRecordDto;

    const post = await this.postRepository.findOne({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException(
        ErrorMessages.POST_NOT_FOUND.message.replace('{id}', postId),
      );
    }

    const reactionType = await this.postReactionTypeRepository.findOne({
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

    const existingRecord = await this.postReactionRecordRepository.findOne({
      where: { user: { id: userId }, post: { id: postId } },
    });

    if (existingRecord) {
      throw new ConflictException(
        ErrorMessages.REACTION_ALREADY_EXISTS.message,
      );
    }

    const reactionRecord = this.postReactionRecordRepository.create({
      user: { id: userId } as User,
      post,
      reactionType,
    });
    return this.postReactionRecordRepository.save(reactionRecord);
  }

  async findAllByPost(postId: string): Promise<PostReactionRecord[]> {
    return this.postReactionRecordRepository.find({
      where: { post: { id: postId } },
      relations: ['reactionType', 'user'],
    });
  }

  async remove(id: string, userId: string): Promise<void> {
    const reactionRecord = await this.postReactionRecordRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!reactionRecord) {
      throw new NotFoundException(
        ErrorMessages.REACTION_RECORD_NOT_FOUND.message.replace('{id}', id),
      );
    }

    if (reactionRecord.user.id !== userId) {
      throw new ConflictException(ErrorMessages.REACTION_NOT_OWNER.message);
    }

    await this.postReactionRecordRepository.remove(reactionRecord);
  }
}
