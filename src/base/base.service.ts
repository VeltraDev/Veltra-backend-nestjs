import { Repository, SelectQueryBuilder } from 'typeorm';
import { BadRequestException } from '@nestjs/common';
import { ErrorMessages } from 'src/exception/error-messages.enum';

export class BaseService<T> {
  constructor(protected readonly repository: Repository<T>) {}

  protected async getAll(
    query: any,
    validSortFields: string[],
    alias: string,
    relations: string[] = [],
  ): Promise<{ total: number; page: number; limit: number; results: T[] }> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      order = 'ASC',
      ...filters
    } = query;

    // Validate sortBy field
    if (!validSortFields.includes(sortBy)) {
      throw new BadRequestException(ErrorMessages.SORT_BY_INVALID);
    }

    // Normalize order to uppercase
    const orderUpperCase = order.toUpperCase();
    if (!['ASC', 'DESC'].includes(orderUpperCase)) {
      throw new BadRequestException(ErrorMessages.ORDER_INVALID);
    }

    const skip = (page - 1) * limit;

    const queryBuilder = this.repository.createQueryBuilder(alias);
    // Add relations if provided
    relations.forEach((relation) => {
      queryBuilder.leftJoinAndSelect(`${alias}.${relation}`, relation);
    });

    // Apply filters
    this.applyFilters(queryBuilder, filters, alias);

    // Sort and pagination
    queryBuilder
      .orderBy(`${alias}.${sortBy}`, orderUpperCase as 'ASC' | 'DESC')
      .skip(skip)
      .take(limit);

    const [results, total] = await queryBuilder.getManyAndCount();

    return {
      total,
      page: Number(page),
      limit: Number(limit),
      results,
    };
  }

  // Helper to apply filters
  protected applyFilters(
    queryBuilder: SelectQueryBuilder<T>,
    filters: any,
    alias: string,
  ) {
    Object.keys(filters).forEach((key) => {
      const value = filters[key];
      if (value) {
        if (typeof value === 'string') {
          queryBuilder.andWhere(`LOWER(${alias}.${key}) LIKE LOWER(:${key})`, {
            [key]: `%${value}%`,
          });
        } else {
          queryBuilder.andWhere(`${alias}.${key} = :${key}`, { [key]: value });
        }
      }
    });
  }
}
