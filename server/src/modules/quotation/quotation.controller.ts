import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { QuotationService } from './quotation.service';
import {
  CreateQuotationDto,
  UpdateQuotationDto,
  QueryQuotationDto,
} from './dto/quotation.dto';

@Controller('quotations')
export class QuotationController {
  constructor(private quotationService: QuotationService) {}

  @Get()
  findAll(@Query() query: QueryQuotationDto) {
    return this.quotationService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.quotationService.findOne(id);
  }

  @Post()
  create(@Body() body: CreateQuotationDto) {
    return this.quotationService.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateQuotationDto) {
    return this.quotationService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.quotationService.remove(id);
  }
}
