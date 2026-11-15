# SABLOX

SABLOX is an original browser-based 2D arena prototype with a small Node.js/WebSocket server.

## Current playable build

- Three selectable fighters: Ranger, Vanguard and Runner.
- Top-down 2D arena with walls, projectiles, enemy bots, health, score and a two-minute round.
- Keyboard/mouse controls and touch joystick, attack and dash controls.
- Basic WebSocket room presence and player-to-player hit handling.
- Installable PWA shell over HTTPS; on Android, open the site in Chrome and choose **Install app** / **Add to Home screen**.

## Run locally

Requires Node.js 18 or newer.

```sh
npm install
npm start
```

Open http://localhost:3000. Health endpoint: http://localhost:3000/api/health.

## Tests

```sh
npm test
```

GitHub Actions runs the test suite on pushes to `main` and pull requests.

## Deploy

The repository includes a Render Blueprint in `render.yaml`. Create a Blueprint from this repository in Render. The service listens on the platform-provided `PORT` and uses `/api/health` as its health check.

## Honest project status

This is an early playable prototype, not a finished Brawl Stars clone. The online layer currently provides basic room presence and simple PvP hit messages; it does not yet have production-grade matchmaking, authoritative movement/combat simulation, accounts, progression, or a native Android APK. All art and game code in this repository are original prototype work.
