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
}

export const gameService = {
    searchGames: async (query: string) => {
        const response = await api.get(`/ExternalGames/search?query=${query}`);
        return response.data;
    },
    addToBacklog: async (game: CreateGameDto) => {
        const response = await api.post('/Game', game); 
        return response.data;
    },

    getBacklog: async (): Promise<BacklogGame[]> => {
        const response = await api.get('/Game');
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
    }
}