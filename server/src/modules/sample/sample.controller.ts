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
import { SampleService } from './sample.service';
import {
  CreateSampleDto,
  UpdateSampleDto,
  QuerySampleDto,
} from './dto/sample.dto';

@Controller('samples')
export class SampleController {
  constructor(private sampleService: SampleService) {}

  @Get()
  findAll(@Query() query: QuerySampleDto) {
    return this.sampleService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sampleService.findOne(id);
  }

  @Post()
  create(@Body() body: CreateSampleDto) {
    return this.sampleService.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateSampleDto) {
    return this.sampleService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sampleService.remove(id);
  }
}
