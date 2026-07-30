import { IsString, IsNotEmpty, IsOptional, IsInt, Min, IsEnum } from 'class-validator';
import { TestTaskStatus } from '@prisma/client';

export class CreateTestTaskDto {
  @IsString()
  @IsNotEmpty()
  sampleId: string;

  @IsString()
  @IsNotEmpty()
  testItemId: string;

  @IsOptional()
  @IsString()
  methodId?: string;

  @IsOptional()
  @IsString()
  equipmentId?: string;

  @IsOptional()
  @IsString()
  assignedToId?: string;
}

export class UpdateTestTaskDto {
  @IsOptional()
  @IsString()
  testItemId?: string;

  @IsOptional()
  @IsString()
  methodId?: string;

  @IsOptional()
  @IsString()
  equipmentId?: string;

  @IsOptional()
  @IsString()
  assignedToId?: string;

  @IsOptional()
  @IsEnum(TestTaskStatus)
  status?: TestTaskStatus;
}

export class QueryTestTaskDto {
  @IsOptional()
  @IsString()
  keyword?: string;

  @IsOptional()
  @IsEnum(TestTaskStatus)
  status?: TestTaskStatus;

  @IsOptional()
  @IsString()
  sampleId?: string;

  @IsOptional()
  @IsString()
  assignedToId?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  pageSize?: number;
}
