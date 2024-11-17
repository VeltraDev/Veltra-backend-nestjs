import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReactionTypesService } from './reaction-types.service';
import { ReactionTypesController } from './reaction-types.controller';
import { ReactionType } from './entities/reaction-type.entity';
import { PostReactionRecord } from 'src/post-reactions/entities/post-reaction-record.entity';
import { CommentReactionRecord } from 'src/comment-reactions/entities/comment-reaction-record.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ReactionType,
      PostReactionRecord,
      CommentReactionRecord,
    ]),
  ],
  controllers: [ReactionTypesController],
  providers: [ReactionTypesService],
  exports: [ReactionTypesService],
})
export class ReactionTypesModule {}
