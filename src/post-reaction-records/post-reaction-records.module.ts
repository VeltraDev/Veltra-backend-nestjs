import { Module } from '@nestjs/common';
import { PostReactionRecordsService } from './post-reaction-records.service';
import { PostReactionRecordsController } from './post-reaction-records.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostReactionRecord } from './entities/post-reaction-record.entity';
import { Post } from 'src/posts/entities/post.entity';
import { PostReactionType } from 'src/post-reaction-types/entities/post-reaction-type.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([PostReactionRecord, Post, PostReactionType]),
  ],
  controllers: [PostReactionRecordsController],
  providers: [PostReactionRecordsService],
  exports: [PostReactionRecordsService],
})
export class PostReactionRecordsModule {}
