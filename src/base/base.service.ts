import { Repository, FindOptionsWhere, Like } from 'typeorm';

export class BaseService<T> {
  constructor(protected readonly repository: Repository<T>) {}

  async findAll(
    currentPage = 1,
    limit = 10,
    sort: string,
    filter: Record<string, any>,
  ) {
    const skip = (currentPage - 1) * limit;
    const where: FindOptionsWhere<T> = {};

    if (filter) {
      Object.keys(filter).forEach((key) => {
        where[key] = Like(`%${filter[key]}%`);
      });
    }

    const order = {};
    if (sort) {
      const [field, direction] = sort.split(':');
      order[field] = direction.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    } else {
      order['createdAt'] = 'DESC';
    }

    const [result, total] = await this.repository.findAndCount({
      where,
      order,
      take: limit,
      skip,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      meta: {
        current: currentPage,
        pageSize: limit,
        pages: totalPages,
        total: total,
      },
      result,
    };
  }

}
