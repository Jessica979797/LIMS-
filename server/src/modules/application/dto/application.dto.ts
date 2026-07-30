import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  Min,
  IsEnum,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApplicationStatus, ReportForm } from '@prisma/client';

export class ApplicationItemDto {
  @IsString()
  @IsNotEmpty()
  testItemId: string;

  @IsOptional()
  @IsString()
  remark?: string;
}

export class CreateApplicationDto {
  @IsString()
  @IsNotEmpty()
  customerId: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  contractNo?: string;

  @IsOptional()
  @IsString()
  expectedDate?: string; // ISO 字符串，service 转 Date

  @IsOptional()
  @IsInt()
  @Min(1)
  reportCopies?: number;

  @IsOptional()
  @IsEnum(ReportForm)
  reportForm?: ReportForm;

  @IsOptional()
  @IsString()
  remark?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ApplicationItemDto)
  items: ApplicationItemDto[];
}

export class UpdateApplicationDto {
  @IsOptional()
  @IsString()
  customerId?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  contractNo?: string;

  @IsOptional()
  @IsString()
  expectedDate?: string | null;

  @IsOptional()
  @IsInt()
  @Min(1)
  reportCopies?: number;

  @IsOptional()
  @IsEnum(ReportForm)
  reportForm?: ReportForm;

  @IsOptional()
  @IsString()
  remark?: string;

  @IsOptional()
  @IsEnum(ApplicationStatus)
  status?: ApplicationStatus;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ApplicationItemDto)
  items?: ApplicationItemDto[];
}

export class QueryApplicationDto {
  @IsOptional()
  @IsString()
  keyword?: string;

  @IsOptional()
  @IsEnum(ApplicationStatus)
  status?: ApplicationStatus;

  @IsOptional()
  @IsString()
  customerId?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  pageSize?: number;
}
