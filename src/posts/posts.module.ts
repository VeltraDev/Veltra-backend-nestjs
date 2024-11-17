import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { Comment } from 'src/comments/entities/comment.entity';
import { PostReactionRecord } from 'src/post-reactions/entities/post-reaction-record.entity';
import { CommentReactionRecord } from 'src/comment-reactions/entities/comment-reaction-record.entity';
import { CommentsModule } from 'src/comments/comments.module';
import { PostReactionsModule } from 'src/post-reactions/post-reactions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Post,
      Comment,
      PostReactionRecord,
      CommentReactionRecord,
    ]),
    CommentsModule,
    PostReactionsModule,
  ],
  controllers: [PostsController],
  providers: [PostsService],
  exports: [PostsService],
})
export class PostsModule {}
