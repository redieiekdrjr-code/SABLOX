# SABLOX 0.1.0

SABLOX is a Roblox-inspired game-platform prototype. It includes a responsive Russian-language frontend and a small Node.js server.

## Run locally

```sh
npm start
```

Open http://localhost:3000. The frontend checks `/api/health` every 15 seconds. If the server is unavailable, game launch remains blocked.

## Deploy

Deploy this repository as a Node web service:
- Root directory: leave empty (repository root)
- Build command: leave empty
- Start command: `npm start`

The service must expose its assigned `PORT`. GitHub Pages can host static files, but cannot run the Node server; use a Node service URL for the working app.

## Current scope

This is an early prototype, not a complete Roblox replacement. Game cards are demo content. Accounts, multiplayer, world storage, moderation, and publishing still need implementation.
