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

  findAll(userId: number) {
    return this.prisma.activity.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
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