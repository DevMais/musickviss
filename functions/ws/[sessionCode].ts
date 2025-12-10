export async function onRequest(context: {
  request: Request;
  env: {
    GAME_ROOM: DurableObjectNamespace;
  };
  params: {
    sessionCode: string;
  };
}): Promise<Response> {
  const { request, env, params } = context;
  const { sessionCode } = params;

  // Upgrade to WebSocket
  if (request.headers.get('Upgrade') !== 'websocket') {
    return new Response('Expected WebSocket', { status: 426 });
  }

  // Get Durable Object for this game room
  const id = env.GAME_ROOM.idFromName(sessionCode.toUpperCase());
  const stub = env.GAME_ROOM.get(id);

  // Forward WebSocket request to Durable Object
  return stub.fetch(request);
}

