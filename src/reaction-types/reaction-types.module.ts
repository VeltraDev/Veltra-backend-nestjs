import { Module } from '@nestjs/common';
import { ReactionTypesService } from './reaction-types.service';
import { ReactionTypesController } from './reaction-types.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReactionType } from './entities/reaction-type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ReactionType])],
  controllers: [ReactionTypesController],
  providers: [ReactionTypesService],
  exports: [ReactionTypesService],
})
export class ReactionTypesModule {}
