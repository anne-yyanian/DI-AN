import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';

@Injectable()
export class ActivityService {
  constructor(private prisma: PrismaService) {}

  create(userId: number, dto: CreateActivityDto) {
    return this.prisma.activity.create({
      data: {
        ...dto,
        userId,
      },
    });
  }

  findAll(userId: number, category?: string, search?: string) {
    return this.prisma.activity.findMany({
      where: {
        userId,
        ...(category && { category }),
        ...(search && {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        }),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getStats(userId: number) {
    const total = await this.prisma.activity.count({
      where: { userId },
    });

    const grouped = await this.prisma.activity.groupBy({
      by: ['category'],
      where: { userId },
      _count: {
        _all: true,
      },
    });

    return {
      total,
      byCategory: grouped.map((item) => ({
        category: item.category,
        count: item._count._all,
      })),
    };
  }

  async findOne(id: number, userId: number) {
    const activity = await this.prisma.activity.findFirst({
      where: { id, userId },
    });
    if (!activity) {
      throw new NotFoundException(`Activity dengan ID ${id} tidak ditemukan`);
    }
    return activity;
  }

  async update(id: number, userId: number, dto: UpdateActivityDto) {
    await this.findOne(id, userId);
    return this.prisma.activity.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: number, userId: number) {
    await this.findOne(id, userId);
    return this.prisma.activity.delete({
      where: { id },
    });
  }
}