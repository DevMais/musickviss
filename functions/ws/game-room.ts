import type { GameState, Player, Track, Answer, LobbySettings } from '../../src/types/game';

export class GameRoom implements DurableObject {
  private state: DurableObjectState;
  private env: {
    DB: D1Database;
    SPOTIFY_CLIENT_ID: string;
    SPOTIFY_CLIENT_SECRET: string;
  };
  private gameState: GameState | null = null;
  private sessions: Map<WebSocket, string> = new Map(); // WebSocket -> playerId
  private players: Map<string, Player> = new Map();

  constructor(state: DurableObjectState, env: any) {
    this.state = state;
    this.env = env;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/init') {
      return this.handleInit(request);
    }

    if (url.pathname === '/join') {
      return this.handleJoin(request);
    }

    if (url.pathname === '/start') {
      return this.handleStartGame();
    }

    // WebSocket upgrade
    if (request.headers.get('Upgrade') === 'websocket') {
      return this.handleWebSocket(request);
    }

    return new Response('Not found', { status: 404 });
  }

  private async handleInit(request: Request): Promise<Response> {
    const body = await request.json();
    const { sessionCode, settings, hostPlayer } = body;

    this.gameState = {
      sessionCode,
      players: [hostPlayer],
      currentQuestion: 0,
      totalQuestions: settings.numSongs,
      currentTrack: null,
      answers: [],
      isGameStarted: false,
      isGameEnded: false,
      settings,
    };

    this.players.set(hostPlayer.id, hostPlayer);

    return new Response(JSON.stringify({ playerId: hostPlayer.id }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  private async handleJoin(request: Request): Promise<Response> {
    const body = await request.json();
    const { playerName } = body;

    if (!this.gameState) {
      return new Response(JSON.stringify({ error: 'Game room not initialized' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const player: Player = {
      id: crypto.randomUUID(),
      name: playerName,
      score: 0,
      isHost: false,
    };

    this.gameState.players.push(player);
    this.players.set(player.id, player);

    this.broadcast({
      type: 'game-state',
      data: this.gameState,
    });

    return new Response(JSON.stringify({ playerId: player.id }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  private async handleStartGame(): Promise<Response> {
    if (!this.gameState) {
      return new Response(JSON.stringify({ error: 'Game room not initialized' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    this.gameState.isGameStarted = true;
    this.broadcast({
      type: 'game-start',
    });

    // Load tracks and start first question
    await this.loadTracks();
    await this.nextQuestion();

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  private async loadTracks(): Promise<void> {
    if (!this.gameState) return;

    const { musicSelection, numSongs } = this.gameState.settings;

    // In production, fetch tracks from Spotify API via internal function call
    // For now, create mock tracks for testing
    const tracks: Track[] = Array.from({ length: numSongs }, (_, i) => ({
      id: `track-${i}`,
      name: `Song ${i + 1}`,
      artist: `Artist ${i + 1}`,
      previewUrl: null,
      albumCover: 'https://via.placeholder.com/300',
      options: [],
    }));
    
    // Store tracks in Durable Object storage
    await this.state.storage.put('tracks', tracks);
  }

  private async nextQuestion(): Promise<void> {
    if (!this.gameState) return;

    const tracks = (await this.state.storage.get('tracks')) as Track[] || [];
    
    if (this.gameState.currentQuestion >= this.gameState.totalQuestions || tracks.length === 0) {
      this.gameState.isGameEnded = true;
      this.broadcast({
        type: 'game-end',
        data: this.gameState,
      });
      return;
    }

    const track = tracks[this.gameState.currentQuestion];
    
    // Generate multiple choice options if needed
    if (this.gameState.settings.answerMode === 'multiple-choice' || 
        this.gameState.settings.answerMode === 'both') {
      const otherTracks = tracks.filter((_, i) => i !== this.gameState.currentQuestion);
      const wrongAnswers = otherTracks
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map(t => `${t.name} - ${t.artist}`);
      
      track.options = [
        `${track.name} - ${track.artist}`,
        ...wrongAnswers,
      ].sort(() => Math.random() - 0.5);
    }

    this.gameState.currentTrack = track;
    this.gameState.answers = [];
    this.gameState.currentQuestion++;

    this.broadcast({
      type: 'question',
      data: {
        track,
        questionNumber: this.gameState.currentQuestion,
        totalQuestions: this.gameState.totalQuestions,
      },
    });

    // Set timeout for question
    setTimeout(() => {
      this.endQuestion();
    }, this.gameState.settings.timeLimit * 1000);
  }

  private async endQuestion(): Promise<void> {
    if (!this.gameState) return;

    // Calculate scores
    const correctAnswer = `${this.gameState.currentTrack?.name} - ${this.gameState.currentTrack?.artist}`;
    
    this.gameState.answers.forEach((answer) => {
      const isCorrect = answer.answer.toLowerCase() === correctAnswer.toLowerCase();
      if (isCorrect && this.gameState?.settings.scoreMethod === 'faster') {
        const timeElapsed = Date.now() - answer.timestamp;
        const timeRemaining = this.gameState.settings.timeLimit * 1000 - timeElapsed;
        const points = Math.max(0, Math.floor((timeRemaining / (this.gameState.settings.timeLimit * 1000)) * 1000));
        answer.points = points;
        answer.isCorrect = true;
        
        const player = this.players.get(answer.playerId);
        if (player) {
          player.score += points;
        }
      } else if (isCorrect) {
        answer.points = 100;
        answer.isCorrect = true;
        
        const player = this.players.get(answer.playerId);
        if (player) {
          player.score += 100;
        }
      }
    });

    // Update game state
    this.gameState.players = Array.from(this.players.values());

    this.broadcast({
      type: 'score-update',
      data: {
        answers: this.gameState.answers,
        players: this.gameState.players,
      },
    });

    // Wait a bit before next question
    setTimeout(() => {
      this.nextQuestion();
    }, 3000);
  }

  private async handleWebSocket(request: Request): Promise<Response> {
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);

    this.acceptWebSocket(server);

    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  }

  private acceptWebSocket(ws: WebSocket): void {
    ws.accept();

    ws.addEventListener('message', async (event) => {
      try {
        const message = JSON.parse(event.data as string);

        if (message.type === 'join') {
          const playerId = message.data.playerId;
          this.sessions.set(ws, playerId);
          
          if (this.gameState) {
            ws.send(JSON.stringify({
              type: 'game-state',
              data: this.gameState,
            }));
          }
        } else if (message.type === 'answer') {
          const playerId = this.sessions.get(ws);
          if (playerId && this.gameState) {
            const answer: Answer = {
              playerId,
              answer: message.data.answer,
              timestamp: message.data.timestamp,
              isCorrect: false,
              points: 0,
            };
            this.gameState.answers.push(answer);
          }
        } else if (message.type === 'game-start') {
          await this.handleStartGame();
        }
      } catch (error) {
        console.error('Error handling WebSocket message:', error);
      }
    });

    ws.addEventListener('close', () => {
      const playerId = this.sessions.get(ws);
      if (playerId) {
        this.sessions.delete(ws);
        this.players.delete(playerId);
        if (this.gameState) {
          this.gameState.players = this.gameState.players.filter(p => p.id !== playerId);
          this.broadcast({
            type: 'game-state',
            data: this.gameState,
          });
        }
      }
    });
  }

  private broadcast(message: any): void {
    const data = JSON.stringify(message);
    this.sessions.forEach((_, ws) => {
      try {
        ws.send(data);
      } catch (error) {
        // WebSocket might be closed
        this.sessions.delete(ws);
      }
    });
  }
}

