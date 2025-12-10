export async function onRequestGet(context: {
  request: Request;
  env: {
    SPOTIFY_CLIENT_ID: string;
  };
}): Promise<Response> {
  const { request, env } = context;

  const redirectUri = `${new URL(request.url).origin}/api/spotify/callback`;
  const scopes = 'user-read-private user-read-email playlist-read-private';
  const state = crypto.randomUUID();

  const authUrl = `https://accounts.spotify.com/authorize?${new URLSearchParams({
    response_type: 'code',
    client_id: env.SPOTIFY_CLIENT_ID,
    scope: scopes,
    redirect_uri: redirectUri,
    state: state,
  })}`;

  return new Response(JSON.stringify({ url: authUrl }), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
    },
  });
}

