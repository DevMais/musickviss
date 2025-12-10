export async function onRequestPost(context: {
  request: Request;
  env: {
    SPOTIFY_CLIENT_ID: string;
    SPOTIFY_CLIENT_SECRET: string;
  };
}): Promise<Response> {
  const { request, env } = context;
  const body = await request.json();

  const { genre, playlistId, limit = 20 } = body;

  // Get access token (in production, retrieve from stored session)
  const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${btoa(`${env.SPOTIFY_CLIENT_ID}:${env.SPOTIFY_CLIENT_SECRET}`)}`,
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
    }),
  });

  if (!tokenResponse.ok) {
    return new Response(JSON.stringify({ error: 'Failed to get access token' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { access_token } = await tokenResponse.json();

  let searchUrl: string;
  if (playlistId) {
    // Get tracks from playlist
    searchUrl = `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=${limit}`;
  } else if (genre) {
    // Search by genre
    searchUrl = `https://api.spotify.com/v1/search?q=genre:${genre}&type=track&limit=${limit}`;
  } else {
    return new Response(JSON.stringify({ error: 'Missing genre or playlistId' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const searchResponse = await fetch(searchUrl, {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });

  if (!searchResponse.ok) {
    return new Response(JSON.stringify({ error: 'Failed to search Spotify' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const data = await searchResponse.json();

  // Transform Spotify API response to our Track format
  const tracks = playlistId
    ? data.items.map((item: any) => ({
        id: item.track.id,
        name: item.track.name,
        artist: item.track.artists[0].name,
        previewUrl: item.track.preview_url,
        albumCover: item.track.album.images[0]?.url || '',
      }))
    : data.tracks.items.map((track: any) => ({
        id: track.id,
        name: track.name,
        artist: track.artists[0].name,
        previewUrl: track.preview_url,
        albumCover: track.album.images[0]?.url || '',
      }));

  return new Response(JSON.stringify({ tracks }), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
    },
  });
}

