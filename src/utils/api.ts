// In development, Vite proxy handles /api routes
// In production, use relative paths (same origin)
const API_BASE = '';

export interface CreateLobbyRequest {
  playerName: string;
  settings: {
    numSongs: number;
    timeLimit: number;
    scoreMethod: 'faster' | 'correct';
    musicSelection: {
      type: 'genre' | 'playlist';
      value: string;
    };
    answerMode: 'multiple-choice' | 'text-input' | 'both';
  };
}

export interface CreateLobbyResponse {
  sessionCode: string;
  playerId: string;
  wsUrl: string;
}

export interface JoinLobbyRequest {
  sessionCode: string;
  playerName: string;
}

export interface JoinLobbyResponse {
  playerId: string;
  wsUrl: string;
}

export const api = {
  async createLobby(request: CreateLobbyRequest): Promise<CreateLobbyResponse> {
    const response = await fetch(`${API_BASE}/api/create-lobby`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error('Failed to create lobby');
    }

    return response.json();
  },

  async joinLobby(request: JoinLobbyRequest): Promise<JoinLobbyResponse> {
    const response = await fetch(`${API_BASE}/api/join-lobby`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error('Failed to join lobby');
    }

    return response.json();
  },

  async getSpotifyAuthUrl(): Promise<{ url: string }> {
    const response = await fetch(`${API_BASE}/api/spotify/auth-url`);
    if (!response.ok) {
      throw new Error('Failed to get Spotify auth URL');
    }
    return response.json();
  },
};

