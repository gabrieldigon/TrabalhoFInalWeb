export interface MajorData {
  id?: number;
  name: string;
}

export interface UserData {
  id?: number;
  fullName: string;
  email: string;
  password: string;
}

export interface GameSessionData {
  id?: number;
  userId: number;
  score: number;
  difficulty: string;
  won: boolean;
  word: string;
  attempts: number;
}

export interface RankingEntry {
  fullName: string;
  email: string;
  totalScore: number;
  gamesWon: number;
  totalGames: number;
}