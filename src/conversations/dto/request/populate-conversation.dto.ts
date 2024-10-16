import {
  IsUUID,
  IsString,
  IsArray,
  ArrayNotEmpty,
  IsOptional,
} from 'class-validator';

export class PopulateConversationDto {
  @IsUUID('4', { message: 'ID của cuộc trò chuyện phải là UUID v4 hợp lệ.' })
  id: string;

  @IsArray({ message: 'fieldToPopulate phải là một mảng.' })
  @ArrayNotEmpty({ message: 'fieldToPopulate không được để trống.' })
  @IsString({
    each: true,
    message: 'Các giá trị trong fieldToPopulate phải là chuỗi.',
  })
  fieldToPopulate: string[];

  @IsOptional()
  @IsArray({ message: 'fieldsToRemove phải là một mảng.' })
  @IsString({
    each: true,
    message: 'Các giá trị trong fieldsToRemove phải là chuỗi.',
  })
  fieldsToRemove?: string[];
}
