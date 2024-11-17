import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ReactionType } from './entities/reaction-type.entity';
import { ErrorMessages } from 'src/exception/error-messages.enum';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateReactionTypeDto } from './dto/request/create-reaction-type.dto';
import { UpdateReactionTypeDto } from './dto/request/update-reaction-type.dto';
import { BaseService } from 'src/base/base.service';
import { FilterReactionTypesDto } from './dto/request/filter-reaction-types.dto';
import { PostReactionRecord } from 'src/post-reactions/entities/post-reaction-record.entity';
import { CommentReactionRecord } from 'src/comment-reactions/entities/comment-reaction-record.entity';

@Injectable()
export class ReactionTypesService extends BaseService<ReactionType> {
  constructor(
    @InjectRepository(ReactionType)
    private readonly reactionTypeRepository: Repository<ReactionType>,
    @InjectRepository(PostReactionRecord)
    private readonly postReactionRepository: Repository<PostReactionRecord>,
    @InjectRepository(CommentReactionRecord)
    private readonly commentReactionRepository: Repository<CommentReactionRecord>,
  ) {
    super(reactionTypeRepository);
  }

  async create(
    createReactionTypeDto: CreateReactionTypeDto,
  ): Promise<ReactionType> {
    const existingReactionType = await this.reactionTypeRepository.findOne({
      where: { type: createReactionTypeDto.type },
    });

    if (existingReactionType) {
      throw new BadRequestException(
        ErrorMessages.REACTION_TYPE_ALREADY_EXISTS.message.replace(
          '{type}',
          createReactionTypeDto.type,
        ),
      );
    }

    const reactionType = this.reactionTypeRepository.create(
      createReactionTypeDto,
    );
    return this.reactionTypeRepository.save(reactionType);
  }

  async getAllReactionTypes(query: FilterReactionTypesDto) {
    const validSortFields = ['type', 'createdAt'];
    return this.getAll(query, validSortFields, 'reactionType');
  }

  async findOne(id: string): Promise<ReactionType> {
    const reactionType = await this.reactionTypeRepository.findOne({
      where: { id },
    });
    if (!reactionType) {
      throw new NotFoundException(
        ErrorMessages.REACTION_TYPE_NOT_FOUND.message.replace('{id}', id),
      );
    }
    return reactionType;
  }

  async update(
    id: string,
    updateReactionTypeDto: UpdateReactionTypeDto,
  ): Promise<ReactionType> {
    const reactionType = await this.findOne(id);

    if (
      updateReactionTypeDto.type &&
      updateReactionTypeDto.type !== reactionType.type
    ) {
      const existingReactionType = await this.reactionTypeRepository.findOne({
        where: { type: updateReactionTypeDto.type },
      });

      if (existingReactionType) {
        throw new BadRequestException(
          ErrorMessages.REACTION_TYPE_ALREADY_EXISTS.message.replace(
            '{type}',
            updateReactionTypeDto.type,
          ),
        );
      }
    }

    Object.assign(reactionType, updateReactionTypeDto);
    return this.reactionTypeRepository.save(reactionType);
  }

  async remove(id: string): Promise<void> {
    const reactionType = await this.findOne(id);

    if (reactionType.type === 'love')
      throw new BadRequestException(
        ErrorMessages.DELETE_POST_REACTION_DEFAULT_LOVE.message,
      );

    await this.postReactionRepository
      .createQueryBuilder()
      .update(PostReactionRecord)
      .set({
        reactionType: () =>
          `(SELECT id FROM reaction_types WHERE type = 'love')`,
      })
      .where('reactionTypeId = :reactionTypeId', { reactionTypeId: id })
      .execute();

    await this.commentReactionRepository
      .createQueryBuilder()
      .update(CommentReactionRecord)
      .set({
        reactionType: () =>
          `(SELECT id FROM reaction_types WHERE type = 'love')`,
      })
      .where('reactionTypeId = :reactionTypeId', { reactionTypeId: id })
      .execute();

    await this.reactionTypeRepository.remove(reactionType);
  }
}
