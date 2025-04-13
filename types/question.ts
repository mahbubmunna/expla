export type Tag = 'Work' | 'Life' | 'Tech' | 'Random' | string;

export interface Question {
    id: string;
    audioUri: string; // Path to local file
    createdAt: number; // Timestamp
    tags: Tag[];
    revisitCount: number;
    lastRevisitedAt?: number;
    status: 'active' | 'archived' | 'answered';
    durationMs?: number; // Optional duration of the clip
}
