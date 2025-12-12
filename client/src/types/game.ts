export interface Game {
    id: number;
    name: string;
    summary?: string;
    firstReleaseDate?: number;
    cover?: {
        url: string;
    };
    releaseDate?: string;
}

export interface BacklogGame {
    id: number;
    title: string;
    coverUrl?: string;
    status: number; 
    platform: string;
    estimatedTime: number;
    rating?: number;
    comments?: string;
    droppedReason?: string | null;
    steamAppId?: string;
}