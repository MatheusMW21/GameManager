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