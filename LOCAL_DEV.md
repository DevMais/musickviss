# Local Development Guide

## Prerequisites

1. **Node.js** (v18 or higher)
2. **npm** or **yarn**
3. **Cloudflare account** (for Wrangler CLI)
4. **Spotify API credentials** (Client ID and Secret)

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .dev.vars.example .dev.vars
   ```
   Then edit `.dev.vars` and add your Spotify credentials.

3. **Set up Cloudflare D1 database (optional for local dev):**
   ```bash
   npx wrangler d1 create music-quiz-db
   ```
   Update `wrangler.toml` with your database ID, or use a local SQLite file for testing.

## Running Locally

### Option 1: Full Stack (Recommended)

This runs both the frontend (built) and Cloudflare Pages Functions:

```bash
npm run build
npm run dev:full
```

This will:
- Build the React app
- Start Wrangler Pages dev server on `http://localhost:8788`
- Serve both the frontend and API functions

### Option 2: Frontend Only (Fast Iteration)

For faster frontend development with hot reload:

**Terminal 1 - Frontend:**
```bash
npm run dev
```
Runs Vite dev server on `http://localhost:5173` with hot reload.

**Terminal 2 - Backend Functions:**
```bash
npm run build
npm run dev:functions
```
Runs Wrangler Pages dev server on `http://localhost:8788` for API functions.

The Vite dev server is configured to proxy `/api` and `/ws` requests to the Wrangler server.

## Development URLs

- **Frontend (Vite dev)**: http://localhost:5173
- **Full Stack (Wrangler)**: http://localhost:8788
- **API Functions**: http://localhost:8788/api/*

## Notes

- Durable Objects work in local dev but may have limitations
- WebSocket connections work in local dev
- Make sure `.dev.vars` is in your `.gitignore` (it should be)
- For D1 database, you can use `wrangler d1 execute music-quiz-db --local --file=schema.sql` to set up local schema

## Troubleshooting

**Port already in use:**
- Change the port in `vite.config.ts` or use `--port` flag

**Functions not working:**
- Make sure you've built the frontend first (`npm run build`)
- Check that `.dev.vars` exists and has correct values

**WebSocket connection issues:**
- Ensure Wrangler is running on port 8788
- Check browser console for connection errors

