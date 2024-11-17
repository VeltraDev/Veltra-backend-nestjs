import { Module } from '@nestjs/common';
import { PostReactionsService } from './post-reactions.service';
import { PostReactionsController } from './post-reactions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostReactionRecord } from './entities/post-reaction-record.entity';
import { ReactionType } from 'src/reaction-types/entities/reaction-type.entity';
import { Post } from 'src/posts/entities/post.entity';
import { UsersModule } from 'src/users/users.module';
import { ReactionTypesModule } from 'src/reaction-types/reaction-types.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PostReactionRecord, ReactionType, Post]),
    UsersModule,
    ReactionTypesModule,
  ],
  controllers: [PostReactionsController],
  providers: [PostReactionsService],
  exports: [PostReactionsService],
})
export class PostReactionsModule {}
