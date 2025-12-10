export interface Player {
  id: string;
  name: string;
  score: number;
  isHost: boolean;
}

export interface LobbySettings {
  numSongs: number;
  timeLimit: number;
  scoreMethod: 'faster' | 'correct';
  musicSelection: {
    type: 'genre' | 'playlist';
    value: string;
  };
  answerMode: 'multiple-choice' | 'text-input' | 'both';
}

export interface GameState {
  sessionCode: string;
  players: Player[];
  currentQuestion: number;
  totalQuestions: number;
  currentTrack: Track | null;
  answers: Answer[];
  isGameStarted: boolean;
  isGameEnded: boolean;
  settings: LobbySettings;
}

export interface Track {
  id: string;
  name: string;
  artist: string;
  previewUrl: string | null;
  albumCover: string;
  options?: string[]; // For multiple choice
}

export interface Answer {
  playerId: string;
  answer: string;
  timestamp: number;
  isCorrect: boolean;
  points: number;
}

export interface WebSocketMessage {
  type: 'join' | 'leave' | 'answer' | 'game-state' | 'question' | 'score-update' | 'game-start' | 'game-end';
  data?: any;
}

