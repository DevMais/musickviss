export async function onRequestPost(context: {
  request: Request;
  env: {
    GAME_ROOM: DurableObjectNamespace;
    DB: D1Database;
  };
}): Promise<Response> {
  const { request, env } = context;
  const body = await request.json();

  const { sessionCode, playerName } = body;

  if (!sessionCode || !playerName) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Check if lobby exists (if DB is available)
  let lobby = null;
  try {
    lobby = await env.DB.prepare(
      `SELECT * FROM lobbies WHERE session_code = ?`
    )
      .bind(sessionCode.toUpperCase())
      .first();
  } catch (error) {
    // If DB is not set up, continue without DB check
    console.warn('DB not available, skipping lobby check:', error);
  }

  // If DB is set up and lobby not found, return error
  // Otherwise, continue (lobby might exist in Durable Object)
  if (env.DB && !lobby) {
    return new Response(JSON.stringify({ error: 'Lobby not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Get Durable Object for this game room
  const id = env.GAME_ROOM.idFromName(sessionCode.toUpperCase());
  const stub = env.GAME_ROOM.get(id);

  // Add player to game room
  const joinResponse = await stub.fetch(new Request('http://dummy/join', {
    method: 'POST',
    body: JSON.stringify({
      playerName,
    }),
  }));

  if (!joinResponse.ok) {
    return new Response(JSON.stringify({ error: 'Failed to join lobby' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const joinData = await joinResponse.json();
  const playerId = joinData.playerId;

  // Get WebSocket URL
  const protocol = new URL(request.url).protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = `${protocol}//${new URL(request.url).hostname}/ws/${sessionCode.toUpperCase()}`;

  return new Response(
    JSON.stringify({
      playerId,
      wsUrl,
    }),
    {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
    }
  );
}

