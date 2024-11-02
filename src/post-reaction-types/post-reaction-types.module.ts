import { Module } from '@nestjs/common';
import { PostReactionTypesService } from './post-reaction-types.service';
import { PostReactionTypesController } from './post-reaction-types.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostReactionType } from './entities/post-reaction-type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PostReactionType])],
  controllers: [PostReactionTypesController],
  providers: [PostReactionTypesService],
  exports: [PostReactionTypesService],
})
export class PostReactionTypesModule {}
