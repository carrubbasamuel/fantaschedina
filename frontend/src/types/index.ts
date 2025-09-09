export interface User {
  id: string;
  username: string;
  email: string;
  team?: Team;
  isApproved: boolean;
  isAdmin: boolean;
  createdAt?: string;
}

export interface Team {
  _id: string;
  name: string;
  logo?: string;
  wins: number;
  draws: number;
  losses: number;
  points: number;
}

export interface Gameday {
  _id: string;
  number: number;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  isCompleted: boolean;
  bettingClosed: boolean;
  createdAt: string;
}

export interface Match {
  _id: string;
  gameday: string | Gameday;
  homeTeam: Team;
  awayTeam: Team;
  matchNumber: number;
  result?: '1' | 'X' | '2';
  isCompleted: boolean;
  createdAt: string;
}

export interface Prediction {
  match: string;
  prediction: '1' | 'X' | '2';
}

export interface Bet {
  _id: string;
  user: string | User;
  gameday: string | Gameday;
  predictions: Prediction[];
  score: number;
  isEvaluated: boolean;
  createdAt: string;
}

export interface LeaderboardEntry {
  position: number;
  username: string;
  score?: number;
  totalScore?: number;
  gamesPlayed?: number;
  averageScore?: number;
  predictions?: number;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

export interface GamedayWithMatches {
  gameday: Gameday;
  matches: Match[];
}
