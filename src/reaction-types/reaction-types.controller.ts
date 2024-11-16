// src/reaction-types/reaction-types.controller.ts
import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  InternalServerErrorException,
  Query,
  Post,
} from '@nestjs/common';
import { ReactionTypesService } from './reaction-types.service';
import { MessageResponse } from 'src/common/decorators/message-response.decorator';
import { CreateReactionTypeDto } from './dto/request/create-reaction-type.dto';
import { UpdateReactionTypeDto } from './dto/request/update-reaction-type.dto';
import { plainToClass } from 'class-transformer';
import { PaginatedReactionTypesDto } from './dto/response/paginate-reaction-types-response.dto';
import { ReactionTypeResponseDto } from './dto/response/reaction-type-response.dto';
import { FilterReactionTypesDto } from './dto/request/filter-reaction-types.dto';
import { ErrorMessages } from 'src/exception/error-messages.enum';

@Controller('reaction-types')
export class ReactionTypesController {
  constructor(private readonly reactionTypesService: ReactionTypesService) {}

  @MessageResponse('Tạo mới loại phản ứng cảm xúc thành công')
  @Post()
  async create(@Body() createReactionTypeDto: CreateReactionTypeDto) {
    const reactionType = await this.reactionTypesService.create(
      createReactionTypeDto,
    );

    return plainToClass(ReactionTypeResponseDto, reactionType, {
      excludeExtraneousValues: true,
    });
  }

  @MessageResponse(
    'Lấy danh sách tất cả loại phản ứng cảm xúc với truy vấn thành công',
  )
  @Get()
  async getAllReactionTypes(@Query() query: FilterReactionTypesDto) {
    const paginatedReactionTypes =
      await this.reactionTypesService.getAllReactionTypes(query);

    const results = paginatedReactionTypes.results.map((reactionType) =>
      plainToClass(ReactionTypeResponseDto, reactionType, {
        excludeExtraneousValues: true,
      }),
    );

    return plainToClass(PaginatedReactionTypesDto, {
      total: paginatedReactionTypes.total,
      page: paginatedReactionTypes.page,
      limit: paginatedReactionTypes.limit,
      results,
    });
  }

  @MessageResponse('Lấy thông tin loại phản ứng cảm xúc thành công')
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const reactionType = await this.reactionTypesService.findOne(id);
    return plainToClass(ReactionTypeResponseDto, reactionType, {
      excludeExtraneousValues: true,
    });
  }

  @MessageResponse('Cập nhật loại phản ứng cảm xúc thành công')
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateReactionTypeDto: UpdateReactionTypeDto,
  ) {
    const reactionType = await this.reactionTypesService.update(
      id,
      updateReactionTypeDto,
    );

    return plainToClass(ReactionTypeResponseDto, reactionType, {
      excludeExtraneousValues: true,
    });
  }

  @MessageResponse('Xóa loại phản ứng cảm xúc thành công')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.reactionTypesService.remove(id);
  }
}
