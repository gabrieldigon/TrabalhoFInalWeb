import { PrismaClient } from '@prisma/client';
import { MajorData } from '../types';

const prisma = new PrismaClient();

export const majorService = {
  async findAll(): Promise<MajorData[]> {
    return prisma.major.findMany({
      orderBy: { name: 'asc' }
    });
  },

  async findById(id: number): Promise<MajorData | null> {
    return prisma.major.findUnique({ where: { id } });
  },

  async create(data: MajorData): Promise<MajorData> {
    return prisma.major.create({ data: { name: data.name } });
  },

  async update(id: number, data: MajorData): Promise<MajorData> {
    return prisma.major.update({
      where: { id },
      data: { name: data.name }
    });
  },

  async delete(id: number): Promise<MajorData> {
    return prisma.major.delete({ where: { id } });
  }
};