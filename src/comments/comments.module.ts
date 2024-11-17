import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity';
import { Post } from 'src/posts/entities/post.entity';
import { CommentReactionsModule } from 'src/comment-reactions/comment-reactions.module'; // Liên kết với CommentReactionsModule

@Module({
  imports: [
    TypeOrmModule.forFeature([Comment, Post]),
    CommentReactionsModule,
  ],
  controllers: [CommentsController],
  providers: [CommentsService],
  exports: [CommentsService],
})
export class CommentsModule {}
