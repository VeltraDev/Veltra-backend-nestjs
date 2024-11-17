import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { CommentsModule } from 'src/comments/comments.module'; // Liên kết với CommentsModule
import { PostReactionsModule } from 'src/post-reactions/post-reactions.module'; // Liên kết với PostReactionsModule

@Module({
  imports: [
    TypeOrmModule.forFeature([Post]),
    CommentsModule,
    PostReactionsModule,
  ],
  controllers: [PostsController],
  providers: [PostsService],
  exports: [PostsService],
})
export class PostsModule {}
