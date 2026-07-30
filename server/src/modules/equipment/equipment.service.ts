import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import {
  CreateEquipmentDto,
  UpdateEquipmentDto,
  QueryEquipmentDto,
} from './dto/equipment.dto';

@Injectable()
export class EquipmentService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryEquipmentDto) {
    const { keyword, status } = query;
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 10;
    const where = {
      ...(status && { status }),
      ...(keyword && {
        OR: [
          { code: { contains: keyword } },
          { name: { contains: keyword } },
          { serialNo: { contains: keyword } },
        ],
      }),
    };
    const [list, total] = await Promise.all([
      this.prisma.equipment.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.equipment.count({ where }),
    ]);
    return { list, total, page, pageSize };
  }

  findOne(id: string) {
    return this.prisma.equipment.findUnique({ where: { id } });
  }

  async create(data: CreateEquipmentDto) {
    const { calibrateDate, calibrateDue, ...rest } = data;
    return this.prisma.equipment.create({
      data: {
        ...rest,
        calibrateDate: calibrateDate ? new Date(calibrateDate) : null,
        calibrateDue: calibrateDue ? new Date(calibrateDue) : null,
      },
    });
  }

  async update(id: string, data: UpdateEquipmentDto) {
    const { calibrateDate, calibrateDue, ...rest } = data;
    const updateData: any = { ...rest };
    if (calibrateDate !== undefined) {
      updateData.calibrateDate = calibrateDate ? new Date(calibrateDate) : null;
    }
    if (calibrateDue !== undefined) {
      updateData.calibrateDue = calibrateDue ? new Date(calibrateDue) : null;
    }
    return this.prisma.equipment.update({ where: { id }, data: updateData });
  }

  remove(id: string) {
    return this.prisma.equipment.delete({ where: { id } });
  }
}
