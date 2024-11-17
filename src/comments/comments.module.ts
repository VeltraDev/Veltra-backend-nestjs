import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { PostCommentsController } from './post-comments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity';
import { Post } from 'src/posts/entities/post.entity';
import { CommentReactionsModule } from 'src/comment-reactions/comment-reactions.module';
import { CommentReactionRecord } from 'src/comment-reactions/entities/comment-reaction-record.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Comment, Post, CommentReactionRecord]),
    CommentReactionsModule,
  ],
  controllers: [CommentsController, PostCommentsController],
  providers: [CommentsService],
  exports: [CommentsService],
})
export class CommentsModule {}
