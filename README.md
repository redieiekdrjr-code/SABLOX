# SABLOX Arena 0.6.0

SABLOX is an original horizontal, top-down 2D arena game inspired by the fast matches and readable combat of hero-brawler games. It is a standalone game project — not a user-generated-world platform.

## Playable prototype

- Landscape 16:9 arena with touch controls for movement, attack and dash.
- Three selectable original fighters: Ranger, Vanguard and Runner.
- Different movement speeds, weapon damage, firing rates and dash abilities.
- Bot opponents with tank, scout and raider archetypes.
- Walls, projectiles, hit effects, health bars, score target and two-minute rounds.
- Keyboard/mouse support and mobile auto-aim.
- Basic WebSocket room presence and player-to-player hit handling.
- Android WebView wrapper configured for landscape orientation.
- Installable PWA with landscape display preference.

## Run locally

Requires Node.js 18 or newer.

```sh
npm install
npm start
```

Open http://localhost:3000. The root URL opens the game directly. Health endpoint: http://localhost:3000/api/health.

## Tests

```sh
npm test
```

GitHub Actions runs the test suite on pushes to `main` and pull requests.

## Deploy

The server listens on the platform-provided `PORT` and serves the game and WebSocket endpoint `/ws`. Configure the Android build variable `SABLOX_SERVER_URL` to the deployed server URL before building the APK.

## Honest project status

This is a playable prototype, not a finished commercial brawler. The online layer currently provides basic room presence and simple PvP hit messages; production-grade matchmaking, authoritative movement/combat simulation, accounts, progression, polished original character art, multiple maps and full 3v3 gameplay remain future work. All game code and art are original prototype work.
