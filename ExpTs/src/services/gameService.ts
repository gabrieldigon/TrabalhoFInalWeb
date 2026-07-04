import { PrismaClient } from '@prisma/client';
import { GameSessionData, RankingEntry } from '../types';

const prisma = new PrismaClient();

export const gameService = {
  async saveScore(data: GameSessionData) {
    return prisma.gameSession.create({ data });
  },

  async getRanking(): Promise<RankingEntry[]> {
    const results = await prisma.gameSession.groupBy({
      by: ['userId'],
      _sum: { score: true },
      _count: { id: true },
      orderBy: { _sum: { score: 'desc' } },
      take: 10,
    });

    const ranking: RankingEntry[] = [];

    for (const result of results) {
      const user = await prisma.user.findUnique({
        where: { id: result.userId }
      });

      if (user) {
        const gamesWon = await prisma.gameSession.count({
          where: { userId: result.userId, won: true }
        });

        ranking.push({
          fullName: user.fullName,
          email: user.email,
          totalScore: result._sum.score || 0,
          gamesWon,
          totalGames: result._count.id
        });
      }
    }

    return ranking;
  },

  async getUserSessions(userId: number) {
    return prisma.gameSession.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20
    });
  }
};