# SABLOX 0.5.0

SABLOX is an original browser-based 2D arena prototype with a small Node.js/WebSocket server.

## Current playable build

- Three selectable fighters: Ranger, Vanguard and Runner, with different movement, weapons and dash abilities.
- Top-down arena with walls, projectiles, hit effects, health bars, score target and a two-minute round.
- Three bot archetypes: slow heavy tank, fast scout and balanced raider.
- Keyboard/mouse controls and touch joystick, attack and dash controls.
- Mobile auto-aim against the nearest bot and visible dash cooldown.
- Basic WebSocket room presence and player-to-player hit handling.
- Installable PWA shell over HTTPS with an offline app shell and custom icon.

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

The repository includes a Render Blueprint in `render.yaml`. Create a Blueprint from this repository in Render. The service listens on the platform-provided `PORT` and uses `/api/health` as its health check. Render currently reports that payment information is required before it will plan this service.

## Honest project status

This is a playable prototype, not a finished Brawl Stars clone. The online layer currently provides basic room presence and simple PvP hit messages; it does not yet have production-grade matchmaking, authoritative movement/combat simulation, accounts, progression, or a native Android APK. The browser game can be installed as a PWA on supported Android browsers. All art and game code in this repository are original prototype work.
