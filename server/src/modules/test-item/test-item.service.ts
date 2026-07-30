import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateTestItemDto } from './dto/test-item.dto';

@Injectable()
export class TestItemService {
  private readonly logger = new Logger(TestItemService.name);

  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.testItem.findMany({
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });
  }

  create(data: CreateTestItemDto) {
    return this.prisma.testItem.create({ data });
  }

  update(id: string, data: Partial<CreateTestItemDto>) {
    return this.prisma.testItem.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.testItem.delete({ where: { id } });
  }

  // 种子：首次启动种入常用检测项目
  async ensureSeed() {
    const count = await this.prisma.testItem.count();
    if (count > 0) return;
    const items = [
      { code: 'PB', name: '铅(Pb)含量', category: '化学', unit: 'mg/kg' },
      { code: 'CD', name: '镉(Cd)含量', category: '化学', unit: 'mg/kg' },
      { code: 'HG', name: '汞(Hg)含量', category: '化学', unit: 'mg/kg' },
      { code: 'CR', name: '铬(Cr)含量', category: '化学', unit: 'mg/kg' },
      { code: 'PH', name: 'pH值', category: '化学', unit: '' },
    ];
    await this.prisma.testItem.createMany({ data: items });
    this.logger.log(`已种入 ${items.length} 个检测项目`);
  }
}
