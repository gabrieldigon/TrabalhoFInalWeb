import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { UserData } from '../types';

const prisma = new PrismaClient();

const SALT_ROUNDS = 10;

export const userService = {
  async findAll() {
    return prisma.user.findMany({
      orderBy: { fullName: 'asc' }
    });
  },

  async findById(id: number) {
    return prisma.user.findUnique({ where: { id } });
  },

  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },

  async create(data: UserData) {
    const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);
    return prisma.user.create({
      data: {
        fullName: data.fullName,
        email: data.email,
        password: hashedPassword
      }
    });
  },

  async validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
};