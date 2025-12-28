import axios from 'axios';
import { BacklogGame } from '../types/game';

export const api = axios.create({
    baseURL: 'http://localhost:5282/api',
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
        const response = await api.get('/Game');
        return response.data;
    },

    create: async (game: CreateGameDto) => {
        const response = await api.post('/Game', game);
        return response.data;
    },

    update: async (id: number, game: any) => {
        const response = await api.put(`/Game/${id}`, game);
        return response.data;
    },

    updateGame: async (id: number, game: any) => {
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
        const response = await api.get('/Hltb/search', {
            params: { gameName } 
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
        const response = await api.get('/ExternalGames/popular');
        return response.data;
    },
}