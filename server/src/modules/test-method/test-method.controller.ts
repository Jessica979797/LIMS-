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
import { TestMethodService } from './test-method.service';
import {
  CreateTestMethodDto,
  UpdateTestMethodDto,
  QueryTestMethodDto,
} from './dto/test-method.dto';

@Controller('test-methods')
export class TestMethodController {
  constructor(private testMethodService: TestMethodService) {}

  @Get()
  findAll(@Query() query: QueryTestMethodDto) {
    return this.testMethodService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.testMethodService.findOne(id);
  }

  @Post()
  create(@Body() body: CreateTestMethodDto) {
    return this.testMethodService.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateTestMethodDto) {
    return this.testMethodService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.testMethodService.remove(id);
  }
}
