export interface FixtureData {
  opponent: string;
  date: string | Date;
  venue: string;
  isHome: boolean;
}

export interface MatchResult {
  result: "WIN" | "LOSS" | "DRAW";
  score: string;
  scorers: PlayerMatchStat[];
  assists: PlayerMatchStat[];
  cleanSheet?: string; // Goalkeeper ID if clean sheet
  cards: CardRecord[];
}

interface PlayerMatchStat {
  playerId: string;
  count: number;
}

interface CardRecord {
  playerId: string;
  type: "YELLOW" | "RED";
  minute: number;
}
