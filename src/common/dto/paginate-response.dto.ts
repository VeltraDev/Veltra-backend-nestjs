export class PaginatedDto<T> {
  total: number;
  page: number;
  limit: number;
  results: T[];
}
