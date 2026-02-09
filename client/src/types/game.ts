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
    timeMain?: number;
    timeExtra?: number;
    timeCompletionist?: number;
    myGoal?: number; 
    timePlayed?: number;
    externalId?: string;
    createdAt?: string;
    completedAt?: string | null;
}

export interface Review {
    id: number;
    rating: number;
    body?: string;
    playedAt?: string | null;
    createdAt: string;
    updatedAt?: string | null;
}
