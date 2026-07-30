import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Request,
} from '@nestjs/common';
import { TestResultService } from './test-result.service';
import {
  CreateTestResultDto,
  UpdateTestResultDto,
  QueryTestResultDto,
} from './dto/test-result.dto';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('test-results')
export class TestResultController {
  constructor(private testResultService: TestResultService) {}

  @Get()
  findAll(@Query() query: QueryTestResultDto) {
    return this.testResultService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.testResultService.findOne(id);
  }

  @Post()
  @Roles('lab_tester')
  create(@Body() body: CreateTestResultDto, @Request() req: any) {
    return this.testResultService.create(body, req.user.id);
  }

  @Patch(':id')
  @Roles('lab_tester')
  update(@Param('id') id: string, @Body() body: UpdateTestResultDto) {
    return this.testResultService.update(id, body);
  }

  @Delete(':id')
  @Roles('lab_supervisor')
  remove(@Param('id') id: string) {
    return this.testResultService.remove(id);
  }
}
