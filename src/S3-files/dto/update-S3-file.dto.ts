import { PartialType } from '@nestjs/mapped-types';
import { CreateFileDto } from './create-S3-file.dto';

export class UpdateFileDto extends PartialType(CreateFileDto) {}
