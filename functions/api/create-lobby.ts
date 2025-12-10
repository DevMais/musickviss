import { generateSessionCode } from '../../src/utils/session';

export async function onRequestPost(context: {
  request: Request;
  env: {
    GAME_ROOM: DurableObjectNamespace;
    DB: D1Database;
    SPOTIFY_CLIENT_ID: string;
    SPOTIFY_CLIENT_SECRET: string;
  };
}): Promise<Response> {
  const { request, env } = context;
  const body = await request.json();

  const { playerName, settings } = body;

  if (!playerName || !settings) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Generate unique session code
  const sessionCode = generateSessionCode();

  // Create Durable Object ID for this game room
  const id = env.GAME_ROOM.idFromName(sessionCode);
  const stub = env.GAME_ROOM.get(id);

  // Initialize game room
  const initResponse = await stub.fetch(new Request('http://dummy/init', {
    method: 'POST',
    body: JSON.stringify({
      sessionCode,
      settings,
      hostPlayer: {
        id: crypto.randomUUID(),
        name: playerName,
        score: 0,
        isHost: true,
      },
    }),
  }));

  if (!initResponse.ok) {
    return new Response(JSON.stringify({ error: 'Failed to create game room' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const initData = await initResponse.json();
  const playerId = initData.playerId;

  // Store lobby in D1 database
  await env.DB.prepare(
    `INSERT INTO lobbies (session_code, settings, created_at) VALUES (?, ?, ?)`
  )
    .bind(sessionCode, JSON.stringify(settings), new Date().toISOString())
    .run();

  // Get WebSocket URL
  const protocol = new URL(request.url).protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = `${protocol}//${new URL(request.url).hostname}/ws/${sessionCode}`;

  return new Response(
    JSON.stringify({
      sessionCode,
      playerId,
      wsUrl,
    }),
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );
}

