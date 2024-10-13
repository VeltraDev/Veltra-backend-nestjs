import { Controller } from '@nestjs/common';
import { DatabasesService } from './databases.service';

@Controller('database')
export class DatabasesController {
  constructor(private readonly databasesService: DatabasesService) {}
}
