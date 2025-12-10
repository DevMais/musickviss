# Production Deployment Checklist

## Pre-Deployment

1. **Set up Cloudflare D1 Database** (optional but recommended):
   ```bash
   npx wrangler d1 create music-quiz-db
   ```
   - Copy the `database_id` from the output
   - Update `wrangler.toml` with the actual `database_id`
   - Run the schema: `npx wrangler d1 execute music-quiz-db --file=schema.sql`

2. **Set Spotify Secrets in Cloudflare**:
   ```bash
   wrangler secret put SPOTIFY_CLIENT_ID
   wrangler secret put SPOTIFY_CLIENT_SECRET
   ```
   Enter your credentials when prompted.

3. **Update Spotify Redirect URI**:
   - Go to https://developer.spotify.com/dashboard
   - Add your production URL: `https://your-domain.pages.dev/api/spotify/callback`

## Deployment

### Option 1: Git Integration (Recommended)

1. **In Cloudflare Pages Dashboard**:
   - Connect your Git repository
   - Set build command: `npm run build`
   - Set output directory: `dist`
   - **IMPORTANT**: Leave "Deploy command" EMPTY or remove it
   - Cloudflare Pages will automatically deploy the `dist` folder after build

2. **Push to your repository** - Cloudflare will automatically build and deploy

### Option 2: Manual Deploy

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Deploy to Cloudflare Pages**:
   ```bash
   npm run deploy
   ```

   Or directly:
   ```bash
   npx wrangler pages deploy dist
   ```

## Post-Deployment

1. **Verify Durable Objects are working**:
   - Check Cloudflare dashboard → Workers & Pages → Durable Objects
   - Ensure the `GameRoom` class is registered

2. **Test the application**:
   - Create a lobby
   - Join with a session code
   - Test WebSocket connections
   - Verify Spotify integration

## Troubleshooting

- **Durable Objects not found**: Make sure `_worker.ts` exports `GameRoom` correctly
- **Secrets not working**: Verify secrets are set with `wrangler secret list`
- **Database errors**: Check if D1 database is created and schema is applied
- **WebSocket issues**: Ensure the WebSocket URL uses `wss://` in production

## Environment Variables

All environment variables should be set as Cloudflare secrets, NOT in `wrangler.toml`:
- `SPOTIFY_CLIENT_ID`
- `SPOTIFY_CLIENT_SECRET`

## Notes

- The app will work without D1 database (lobbies won't persist, but game rooms will work via Durable Objects)
- Mock tracks are used if Spotify API fails
- CORS is enabled for all API routes

