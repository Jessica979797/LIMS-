import { IsString, IsNotEmpty, IsOptional, IsObject } from 'class-validator';

export class CreateReportTemplateDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsString()
  @IsNotEmpty()
  fileUrl: string;

  @IsOptional()
  @IsObject()
  fields?: any;
}
