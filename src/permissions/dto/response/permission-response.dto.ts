import { Expose } from 'class-transformer';

export class PermissionResponseDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  apiPath: string;

  @Expose()
  method: string;

  @Expose()
  module: string;

  @Expose()
  createdAt: string;
}
