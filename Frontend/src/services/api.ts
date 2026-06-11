import toast from 'react-hot-toast';

let BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

// Ensure the URL ends with /api/v1 for consistency with backend routes
if (!BASE_URL.includes('/api/v1')) {
    BASE_URL = BASE_URL.replace(/\/$/, '') + '/api/v1';
}

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message: string;
    timestamp: string;
}

export interface User {
    id: string;
    name: string;
    email: string;
}

export interface TokenResponse {
    accessToken: string;
    tokenType: string;
    user: User;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
}

export interface MatchSummary {
    id: string;
    date: string;
    homeTeam: string;
    awayTeam: string;
    homeScore: number;
    awayScore: number;
    status: string;
}

export interface MatchEvent {
    id: number;
    time: string;
    type: string;
    player: string;
    team: string;
    description: string;
}

export interface MatchDetail extends MatchSummary {
    durationMinutes: number;
    events: MatchEvent[];
}

export interface StatComparison {
    name: string;
    home: number | string;
    away: number | string;
}

export interface MatchOverview extends MatchSummary {
    matchId: string;
    possession: Record<string, number>;
    passAccuracy: Record<string, number>;
    stats: StatComparison[];
}

export interface PlayerSummary {
    id: string;
    name: string;
    teamId: string;
    teamName: string;
    position: string;
    number: number;
    rating: number;
    goals: number;
    assists: number;
}

export interface PlayerAttributes {
    speed: number;
    passing: number;
}

export interface PlayerDetail extends PlayerSummary {
    minutesPlayed: number;
    passesAttempted: number;
    passesCompleted: number;
    turnovers: number;
    passAccuracy: number;
    turnoverRate: number;
    attributes: PlayerAttributes;
}

export interface Recommendation {
    id: string;
    scope: string;
    matchId?: string;
    teamId?: string;
    playerId?: string;
    title: string;
    description: string;
    priority: string;
    confidence: number;
    reasoning: string;
    metrics: Record<string, number | string | boolean>;
}

export interface TeamStats {
    wins: number;
    draws: number;
    losses: number;
    goalsFor: number;
    goalsAgainst: number;
    avgRating: number;
}

export interface TeamAttributes {
    attack: number;
    passing: number;
    defense: number;
    speed: number;
    dribbling: number;
    shooting: number;
}

export interface TeamSummary {
    id: string;
    name: string;
    stadium: string;
    coach: string;
    founded: number;
    players: number;
    emoji: string;
    stats: TeamStats;
    attributes: TeamAttributes;
}

export interface HeatmapPoint {
    x: number;
    y: number;
    value: number;
}

export interface PlayerHeatmap {
    playerId: string;
    playerName: string;
    points: HeatmapPoint[];
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
    try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const headers = new Headers(options.headers);
        
        if (token && !headers.has('Authorization')) {
            headers.set('Authorization', `Bearer ${token}`);
        }

        const response = await fetch(`${BASE_URL}${path}`, {
            ...options,
            headers,
        });
        
        const result: ApiResponse<T> = await response.json();
        
        if (!response.ok || !result.success) {
            throw new Error(result.message || 'API request failed');
        }
        
        return result.data;
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Connection error';
        toast.error(message);
        throw error;
    }
}

export const api = {
    matches: {
        list: () => request<MatchSummary[]>('/matches'),
        get: (id: string) => request<MatchDetail>(`/matches/${id}`),
        getOverview: (id: string) => request<MatchOverview>(`/matches/${id}/overview`),
        delete: (id: string | number) => request<void>(`/matches/${id}`, { method: 'DELETE' }),
    },
    players: {
        list: () => request<PlayerSummary[]>('/players'),
        get: (id: string) => request<PlayerDetail>(`/players/${id}/stats`),
        getHeatmap: (id: string) => request<PlayerHeatmap>(`/players/${id}/heatmap`),
    },
    teams: {
        list: () => request<TeamSummary[]>('/teams'),
        get: (id: string) => request<TeamSummary>(`/teams/${id}`),
        getPlayers: (id: string) => request<PlayerSummary[]>(`/teams/${id}/players`),
    },
    recommendations: {
        list: () => request<Recommendation[]>('/recommendations'),
        forMatch: (matchId: string) => request<Recommendation[]>(`/recommendations/match/${matchId}`),
        forPlayer: (playerId: string) => request<Recommendation[]>(`/recommendations/player/${playerId}`),
    },
    upload: {
        video: (formData: FormData) => request<{ task_id: string }>('/analysis/upload', {
            method: 'POST',
            body: formData,
        }),
        getTaskStatus: (taskId: string) => request<{ status: string, error_message?: string }>(`/analysis/tasks/${taskId}`),
        matchJson: (formData: FormData) => request<{ match_id: string, filename: string }>('/upload', {
            method: 'POST',
            body: formData,
        }),
    },
    auth: {
        login: (data: LoginRequest) => request<TokenResponse>('/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        }),
        register: (data: RegisterRequest) => request<TokenResponse>('/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        }),
        me: (token: string) => request<User>('/auth/me', {
            headers: { 'Authorization': `Bearer ${token}` },
        }),
    }
};

