const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { spawn } = require('node:child_process');
const WebSocket = require('ws');

const port = 31000 + Math.floor(Math.random() * 20000);
const base = 'http://127.0.0.1:' + port;
let child;

function waitForMessage(ws, predicate, timeout = 4000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => { cleanup(); reject(new Error('Timed out waiting for WebSocket message')); }, timeout);
    const onMessage = raw => {
      let data;
      try { data = JSON.parse(raw.toString()); } catch { return; }
      if (predicate(data)) { cleanup(); resolve(data); }
    };
    const cleanup = () => { clearTimeout(timer); ws.off('message', onMessage); };
    ws.on('message', onMessage);
  });
}

before(async () => {
  child = spawn(process.execPath, ['server.js'], {
    cwd: process.cwd(),
    env: { ...process.env, PORT: String(port) },
    stdio: 'ignore'
  });
  const deadline = Date.now() + 7000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(base + '/api/health');
      if (response.ok) return;
    } catch {}
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error('SABLOX server did not start');
});

after(() => {
  if (child && !child.killed) child.kill('SIGTERM');
});

test('arena browser script has valid JavaScript syntax', () => {
  const html = fs.readFileSync('arena.html', 'utf8');
  const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
  assert.ok(scripts.length, 'arena script exists');
  assert.doesNotThrow(() => new vm.Script(scripts[scripts.length - 1][1]));
});

test('health endpoint reports the running service', async () => {
  const response = await fetch(base + '/api/health');
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.status, 'ok');
  assert.equal(body.service, 'SABLOX');
});

test('game catalogue and homepage are served', async () => {
  const games = await fetch(base + '/api/games');
  assert.equal(games.status, 200);
  assert.equal((await games.json()).games[0].id, 'arena');
  const home = await fetch(base + '/');
  assert.equal(home.status, 200);
  assert.match(await home.text(), /SABLOX/);
});

test('two players join the same room and receive state updates', async () => {
  const a = new WebSocket('ws://127.0.0.1:' + port + '/ws');
  await new Promise((resolve, reject) => { a.once('open', resolve); a.once('error', reject); });
  const joinedA = await waitForMessage(a, m => m.type === 'joined');
  const b = new WebSocket('ws://127.0.0.1:' + port + '/ws');
  await new Promise((resolve, reject) => { b.once('open', resolve); b.once('error', reject); });
  const joinedB = await waitForMessage(b, m => m.type === 'joined');
  assert.equal(joinedA.room, joinedB.room);
  const statePromise = waitForMessage(b, m => m.type === 'state' && m.players.some(p => p.id === joinedA.id));
  a.send(JSON.stringify({ type: 'state', x: 300, y: 200 }));
  const state = await statePromise;
  const first = state.players.find(p => p.id === joinedA.id);
  assert.equal(first.x, 300);
  assert.equal(first.y, 200);
  assert.equal(first.hp, 100);
  assert.equal(first.score, 0);
  const hitPromise = waitForMessage(b, m => m.type === 'state' && m.players.find(p => p.id === joinedB.id)?.hp === 90);
  a.send(JSON.stringify({ type: 'hit', target: joinedB.id }));
  await hitPromise;
  a.close();
  b.close();
});
