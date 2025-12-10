# Music Quiz App

A multiplayer music quiz game built with React, TypeScript, and Cloudflare Pages.

## Features

- **Multiplayer Support**: Join lobbies with session codes
- **Spotify Integration**: Play music from Spotify's catalog
- **Real-time Scoring**: Points based on speed and accuracy
- **Mobile-Friendly**: Responsive design for mobile devices
- **Customizable Settings**: Configure number of songs, time limits, and more

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables for local development:
- Copy `.dev.vars.example` to `.dev.vars` (already done)
- Edit `.dev.vars` and add your Spotify Client ID and Secret

For production deployment:
- Use `wrangler secret put SPOTIFY_CLIENT_ID` to set the client ID
- Use `wrangler secret put SPOTIFY_CLIENT_SECRET` to set the secret
- Do NOT put secrets in `wrangler.toml`

3. Set up Cloudflare D1 Database:
```bash
npx wrangler d1 create music-quiz-db
```

4. Create the database schema:
```sql
CREATE TABLE lobbies (
  session_code TEXT PRIMARY KEY,
  settings TEXT,
  created_at TEXT
);
```

5. Update `wrangler.toml` with your database ID

6. Run development server:
```bash
npm run dev
```

7. Deploy to Cloudflare Pages:
```bash
npm run build
npm run deploy
```

**Important:** Make sure you're using `npm run deploy` (which runs `wrangler pages deploy`), not `wrangler deploy` directly. The latter is for Workers, not Pages.

Before deploying, make sure to:
- Set secrets in Cloudflare: `wrangler secret put SPOTIFY_CLIENT_ID` and `wrangler secret put SPOTIFY_CLIENT_SECRET`
- Update the `database_id` in `wrangler.toml` if you're using D1

## Project Structure

- `src/` - React frontend components
- `functions/` - Cloudflare Pages Functions (API routes and Durable Objects)
- `wrangler.toml` - Cloudflare configuration

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Backend**: Cloudflare Pages Functions
- **Real-time**: Cloudflare Durable Objects (WebSockets)
- **Database**: Cloudflare D1
- **Music API**: Spotify Web API

