import { Module } from '@nestjs/common';
import { CommentReactionsService } from './comment-reactions.service';
import { CommentReactionsController } from './comment-reactions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentReactionRecord } from './entities/comment-reaction-record.entity';
import { ReactionType } from 'src/reaction-types/entities/reaction-type.entity';
import { Comment } from 'src/comments/entities/comment.entity';
import { ReactionTypesModule } from 'src/reaction-types/reaction-types.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CommentReactionRecord, ReactionType, Comment]),
    ReactionTypesModule,
    UsersModule,
  ],
  controllers: [CommentReactionsController],
  providers: [CommentReactionsService],
  exports: [CommentReactionsService],
})
export class CommentReactionsModule {}
