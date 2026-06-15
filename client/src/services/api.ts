import axios from "axios";
import { BacklogGame, Review } from "../types/game";

export const api = axios.create({
  baseURL: "http://localhost:5282/api",
});

export interface CreateGameDto {
  title: string;
  coverUrl?: string;
  externalId?: string;
  platform: string;
  status: number;
  steamAppId?: string;
  comments?: string;
  timeMain?: number;
  timeExtra?: number;
  timeCompletionist?: number;
  timePlayed?: number;
  myGoal?: number;
}

export interface CreateReviewDto {
  rating: number;
  body?: string;
  playedAt?: string | null;
  igdbGameId?: number | null;
  gameTitle?: string | null;
  gameCoverUrl?: string | null;
}

export interface UpdateReviewDto {
  rating?: number;
  body?: string;
  playedAt?: string | null;
}

api.interceptors.request.use(async (config) => {
  const token = await (window as any).Clerk?.session?.getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const gameService = {
  getAll: async (): Promise<BacklogGame[]> => {
    const response = await api.get("/Game");
    return response.data.data;
  },

  create: async (game: CreateGameDto) => {
    const response = await api.post("/Game", game);
    return response.data;
  },

  update: async (id: number, game: any) => {
    const response = await api.put(`/Game/${id}`, game);
    return response.data;
  },

  deleteGame: async (id: number) => {
    const response = await api.delete(`/Game/${id}`);
    return response.data;
  },

  getSteamPrice: async (steamAppId: string) => {
    const response = await api.get(`/Steam/price/${steamAppId}`);
    return response.data;
  },

  findSteamId: async (gameName: string) => {
    const response = await api.get(`/Steam/search/${gameName}`);
    return response.data.steamId;
  },

  findHltbTimes: async (gameName: string) => {
    const response = await api.get("/Hltb/search", {
      params: { gameName },
    });
    return response.data;
  },

  searchGames: async (query: string) => {
    const response = await api.get(`/ExternalGames/search?query=${query}`);
    return response.data;
  },

  getGameDetails: async (id: string) => {
    const response = await api.get(`/ExternalGames/${id}`);
    return response.data;
  },

  getPopularGames: async () => {
    const response = await api.get("/ExternalGames/popular");
    return response.data;
  },

  getReviews: async (gameId: number) => {
    const response = await api.get(`/games/${gameId}/reviews`);
    return response.data.data;
  },

  createReview: async (gameId: number, review: CreateReviewDto) => {
    const response = await api.post(`/games/${gameId}/reviews`, review);
    return response.data;
  },

  updateReview: async (gameId: number, id: number, review: UpdateReviewDto) => {
    const response = await api.put(`/games/${gameId}/reviews/${id}`, review);
    return response.data;
  },

  deleteReview: async (gameId: number, id: number) => {
    const response = await api.delete(`/games/${gameId}/reviews/${id}`);
    return response.data;
  },

  getFeedReviews: async (take = 8) => {
    const response = await api.get(`/feed/reviews?pageSize=${take}`);
    return response.data.data;
  },

  getRecentReviewedGames: async (take = 6) => {
    const response = await api.get(`/feed/recent-games?pageSize=${take}`);
    return response.data.data;
  },

  getDiary: async () => {
    const response = await api.get(`/diary`);
    return response.data.data as Review[];
  },
};
