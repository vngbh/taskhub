import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.task.findMany();
  }

  findById(id: string) {
    return this.prisma.task.findUnique({ where: { id } });
  }
}
