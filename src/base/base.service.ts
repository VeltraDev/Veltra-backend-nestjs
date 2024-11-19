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
      throw new BadRequestException(ErrorMessages.SORT_BY_INVALID.message);
    }

    // Normalize order to uppercase
    const orderUpperCase = order.toUpperCase();
    if (!['ASC', 'DESC'].includes(orderUpperCase)) {
      throw new BadRequestException(ErrorMessages.ORDER_INVALID.message);
    }

    const skip = (page - 1) * limit;

    const queryBuilder = this.repository.createQueryBuilder(alias);

    // Add relations if provided
    relations.forEach((relationPath) => {
      const relationParts = relationPath.split('.');
      let parentAlias = alias;

      relationParts.forEach((part, index) => {
        const relationAlias = relationParts.slice(0, index + 1).join('_');
        const relation = `${parentAlias}.${part}`;

        // Check if the join has already been made to avoid duplicates
        if (
          !queryBuilder.expressionMap.aliases.find(
            (a) => a.name === relationAlias,
          )
        ) {
          queryBuilder.leftJoinAndSelect(relation, relationAlias);
        }

        parentAlias = relationAlias;
      });
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

      if (value !== undefined && value !== null) {
        if (key === 'conversationIds' && Array.isArray(value)) {
          queryBuilder.andWhere(`${alias}.id IN (:...conversationIds)`, {
            conversationIds: value,
          });
        } else if (typeof value === 'string') {
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
