import { IsString, IsNotEmpty, IsOptional, IsInt, Min, IsEnum } from 'class-validator';
import { ReportStatus } from '@prisma/client';

export class CreateReportDto {
  @IsString()
  @IsNotEmpty()
  applicationId: string;

  @IsOptional()
  @IsString()
  templateId?: string;

  @IsOptional()
  @IsString()
  conclusion?: string;
}

export class UpdateReportDto {
  @IsOptional()
  @IsString()
  templateId?: string;

  @IsOptional()
  @IsString()
  conclusion?: string;
}

export class QueryReportDto {
  @IsOptional()
  @IsString()
  keyword?: string;

  @IsOptional()
  @IsEnum(ReportStatus)
  status?: ReportStatus;

  @IsOptional()
  @IsString()
  applicationId?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  pageSize?: number;
}

// 签发表单（编制/审核/批准通用，可附审批意见）
export class SignoffDto {
  @IsOptional()
  @IsString()
  comment?: string;
}
