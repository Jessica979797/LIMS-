import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  Min,
  IsEnum,
  IsObject,
} from 'class-validator';
import { ResultConclusion } from '@prisma/client';

export class CreateTestResultDto {
  @IsString()
  @IsNotEmpty()
  taskId: string;

  @IsOptional()
  @IsString()
  value?: string;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsString()
  limit?: string;

  @IsOptional()
  @IsEnum(ResultConclusion)
  conclusion?: ResultConclusion;

  @IsOptional()
  @IsObject()
  rawData?: any;

  @IsOptional()
  @IsObject()
  attachments?: any;

  @IsOptional()
  @IsString()
  remark?: string;
}

export class UpdateTestResultDto {
  @IsOptional()
  @IsString()
  value?: string;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsString()
  limit?: string;

  @IsOptional()
  @IsEnum(ResultConclusion)
  conclusion?: ResultConclusion;

  @IsOptional()
  @IsObject()
  rawData?: any;

  @IsOptional()
  @IsObject()
  attachments?: any;

  @IsOptional()
  @IsString()
  remark?: string;
}

export class QueryTestResultDto {
  @IsOptional()
  @IsString()
  keyword?: string;

  @IsOptional()
  @IsEnum(ResultConclusion)
  conclusion?: ResultConclusion;

  @IsOptional()
  @IsString()
  taskId?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  pageSize?: number;
}
