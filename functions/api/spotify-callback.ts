export async function onRequestGet(context: {
  request: Request;
  env: {
    SPOTIFY_CLIENT_ID: string;
    SPOTIFY_CLIENT_SECRET: string;
  };
}): Promise<Response> {
  const { request, env } = context;
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');

  if (error) {
    return new Response(
      `Authentication failed: ${error}. <a href="/">Return to home</a>`,
      {
        status: 400,
        headers: { 'Content-Type': 'text/html' },
      }
    );
  }

  if (!code) {
    return new Response('Missing authorization code', { status: 400 });
  }

  const redirectUri = `${url.origin}/api/spotify/callback`;

  // Exchange code for access token
  const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${btoa(`${env.SPOTIFY_CLIENT_ID}:${env.SPOTIFY_CLIENT_SECRET}`)}`,
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
    }),
  });

  if (!tokenResponse.ok) {
    return new Response('Failed to exchange token', { status: 500 });
  }

  const tokenData = await tokenResponse.json();

  // Store token (in production, use KV or D1 to store per-session)
  // For now, redirect back with success
  return Response.redirect(`${url.origin}/?spotify_auth=success`, 302);
}

