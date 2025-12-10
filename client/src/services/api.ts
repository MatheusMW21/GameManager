import axios from 'axios';

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
    }
}