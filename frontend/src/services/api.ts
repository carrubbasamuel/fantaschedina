import axios from 'axios';
import { Bet, Gameday, GamedayWithMatches, LeaderboardEntry, Match, Prediction, Team, User } from '../types';

const API_BASE_URL = 'https://fantaschedina.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Interceptor per aggiungere il token di autenticazione
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  login: async (email: string, password: string): Promise<{ token: string; user: User }> => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  register: async (username: string, email: string, password: string): Promise<{ token: string; user: User }> => {
    const response = await api.post('/auth/register', { username, email, password });
    return response.data;
  },

  getProfile: async (): Promise<User> => {
    const response = await api.get('/auth/profile');
    return response.data;
  },
};

// Teams API
export const teamsAPI = {
  getAll: async (): Promise<Team[]> => {
    const response = await api.get('/teams');
    return response.data;
  },

  create: async (name: string, logo?: string): Promise<Team> => {
    const response = await api.post('/teams', { name, logo });
    return response.data;
  },

  initialize: async (): Promise<{ message: string; teams: Team[] }> => {
    const response = await api.post('/teams/initialize');
    return response.data;
  },
};

// Gamedays API
export const gamedaysAPI = {
  getAll: async (): Promise<Gameday[]> => {
    const response = await api.get('/gamedays');
    return response.data;
  },

  getActive: async (): Promise<GamedayWithMatches> => {
    const response = await api.get('/gamedays/active');
    return response.data;
  },

  create: async (number: number, name: string, startDate: string, endDate: string): Promise<Gameday> => {
    const response = await api.post('/gamedays', { number, name, startDate, endDate });
    return response.data;
  },

  activate: async (id: string): Promise<Gameday> => {
    const response = await api.put(`/gamedays/${id}/activate`);
    return response.data;
  },

  initializeSeason: async (): Promise<{ message: string; gamedays: Gameday[] }> => {
    const response = await api.post('/gamedays/initialize-season');
    return response.data;
  },

  resetSeason: async (): Promise<{ message: string }> => {
    const response = await api.post('/gamedays/reset-season');
    return response.data;
  },

  closeBetting: async (id: string): Promise<Gameday> => {
    const response = await api.put(`/gamedays/${id}/close-betting`);
    return response.data;
  },
};

// Matches API
export const matchesAPI = {
  getByGameday: async (gamedayId: string): Promise<Match[]> => {
    const response = await api.get(`/matches/gameday/${gamedayId}`);
    return response.data;
  },

  create: async (matchData: { gamedayId: string; homeTeam: string; awayTeam: string; matchNumber: number }): Promise<Match> => {
    const response = await api.post('/matches', matchData);
    return response.data;
  },

  updateResult: async (matchId: string, result: '1' | 'X' | '2'): Promise<Match> => {
    const response = await api.put(`/matches/${matchId}/result`, { result });
    return response.data;
  },
};

// Bets API
export const betsAPI = {
  create: async (gamedayId: string, predictions: Prediction[]): Promise<Bet> => {
    const response = await api.post('/bets', { gamedayId, predictions });
    return response.data;
  },

  getMyBets: async (): Promise<Bet[]> => {
    const response = await api.get('/bets/my-bets');
    return response.data;
  },

  getByGameday: async (gamedayId: string): Promise<Bet> => {
    const response = await api.get(`/bets/gameday/${gamedayId}`);
    return response.data;
  },

  getLeaderboard: async (): Promise<LeaderboardEntry[]> => {
    const response = await api.get('/bets/leaderboard');
    return response.data;
  },

  getGamedayLeaderboard: async (gamedayId: string): Promise<LeaderboardEntry[]> => {
    const response = await api.get(`/bets/leaderboard/${gamedayId}`);
    return response.data;
  },
};

// Admin API
export const adminAPI = {
  getUsers: async (): Promise<User[]> => {
    const response = await api.get('/admin/users');
    return response.data;
  },

  assignTeam: async (userId: string, teamId: string): Promise<User> => {
    const response = await api.put(`/admin/users/${userId}/assign-team`, { teamId });
    return response.data;
  },

  removeTeam: async (userId: string): Promise<User> => {
    const response = await api.put(`/admin/users/${userId}/remove-team`);
    return response.data;
  },

  getAvailableTeams: async (): Promise<Team[]> => {
    const response = await api.get('/admin/available-teams');
    return response.data;
  },

  deleteUser: async (userId: string): Promise<void> => {
    await api.delete(`/admin/users/${userId}`);
  },

  approveUser: async (userId: string): Promise<User> => {
    const response = await api.put(`/admin/users/${userId}/approve`);
    return response.data;
  },
};

export default api;
