import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PostReactionType } from './entities/post-reaction-type.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ErrorMessages } from 'src/exception/error-messages.enum';
import { BaseService } from 'src/base/base.service';
import { CreatePostReactionTypeDto } from './dto/request/create-post-reaction-type.dto';
import { UpdatePostReactionTypeDto } from './dto/request/update-post-reaction-type.dto';

@Injectable()
export class PostReactionTypesService extends BaseService<PostReactionType> {
  constructor(
    @InjectRepository(PostReactionType)
    private readonly postReactionTypeRepository: Repository<PostReactionType>,
  ) {
    super(postReactionTypeRepository);
  }

  async create(
    createPostReactionTypeDto: CreatePostReactionTypeDto,
  ): Promise<PostReactionType> {
    const { type } = createPostReactionTypeDto;

    const existingType = await this.postReactionTypeRepository.findOne({
      where: { type },
    });

    if (existingType) {
      throw new ConflictException(
        ErrorMessages.REACTION_TYPE_ALREADY_EXISTS.message.replace(
          '{type}',
          type,
        ),
      );
    }

    const reactionType = this.postReactionTypeRepository.create(
      createPostReactionTypeDto,
    );
    return this.postReactionTypeRepository.save(reactionType);
  }

  async findAll(): Promise<PostReactionType[]> {
    return this.postReactionTypeRepository.find();
  }

  async findOne(id: string): Promise<PostReactionType> {
    const reactionType = await this.postReactionTypeRepository.findOne({
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
    updatePostReactionTypeDto: UpdatePostReactionTypeDto,
  ): Promise<PostReactionType> {
    const reactionType = await this.findOne(id);

    if (updatePostReactionTypeDto.type) {
      const existingType = await this.postReactionTypeRepository.findOne({
        where: { type: updatePostReactionTypeDto.type },
      });

      if (existingType && existingType.id !== id) {
        throw new ConflictException(
          ErrorMessages.REACTION_TYPE_ALREADY_EXISTS.message.replace(
            '{type}',
            updatePostReactionTypeDto.type,
          ),
        );
      }
    }

    Object.assign(reactionType, updatePostReactionTypeDto);
    return this.postReactionTypeRepository.save(reactionType);
  }

  async remove(id: string): Promise<void> {
    const reactionType = await this.findOne(id);
    await this.postReactionTypeRepository.remove(reactionType);
  }
}
