const http = require('http');
const fs = require('fs');
const path = require('path');
const { WebSocketServer } = require('ws');
const root = __dirname;
const port = Number(process.env.PORT || 3000);
const types = {'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.json':'application/json'};
const clients = new Map();
const rooms = new Map();
let nextId = 1;
const now = () => Date.now();
const number = (value, fallback, min, max) => Number.isFinite(Number(value)) ? Math.max(min, Math.min(max, Number(value))) : fallback;
const server = http.createServer((req,res) => {
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname === '/api/health') {
    res.writeHead(200, {'Content-Type':'application/json','Cache-Control':'no-store'});
    return res.end(JSON.stringify({status:'ok',service:'SABLOX',version:'0.3.0',online:clients.size,rooms:rooms.size}));
  }
  if (url.pathname === '/api/games') {
    res.writeHead(200, {'Content-Type':'application/json','Cache-Control':'no-store'});
    return res.end(JSON.stringify({games:[{id:'arena',name:'SABLOX Arena',mode:'online-1v1',status:'playable'}]}));
  }
  const requested = url.pathname === '/' ? 'index.html' : decodeURIComponent(url.pathname).replace(/^\\/+/, '');
  const file = path.resolve(root, requested);
  if (!file.startsWith(root + path.sep)) { res.writeHead(403); return res.end('Forbidden'); }
  fs.readFile(file, (err,data) => {
    if (err) { res.writeHead(404); return res.end('Not found'); }
    res.writeHead(200, {'Content-Type':types[path.extname(file)] || 'application/octet-stream','X-Content-Type-Options':'nosniff'});
    res.end(data);
  });
});
const wss = new WebSocketServer({server,path:'/ws',maxPayload:2048});
function send(ws,data){if(ws.readyState===1)ws.send(JSON.stringify(data))}
function snapshot(room){return {type:'state',room:room.id,players:[...room.players.values()].map(p=>({id:p.id,name:p.name,x:p.x,y:p.y,hp:p.hp,score:p.score,angle:p.angle}))}}
function broadcast(room){const data=snapshot(room);for(const p of room.players.values())send(p.ws,data)}
function remove(ws){
  const p=clients.get(ws);if(!p)return;clients.delete(ws);
  const room=rooms.get(p.room);if(room){room.players.delete(p.id);for(const other of room.players.values())send(other.ws,{type:'notice',text:p.name+' покинул матч'});if(!room.players.size)rooms.delete(room.id);else broadcast(room)}
}
wss.on('connection',ws=>{
  ws.isAlive=true;
  ws.on('pong',()=>{ws.isAlive=true});
  const id='p'+nextId++;const roomId='arena-'+Math.ceil(nextId/3);
  let room=[...rooms.values()].find(r=>r.players.size<2);
  if(!room){room={id:roomId,players:new Map()};rooms.set(room.id,room)}
  const player={id,name:'Игрок '+id.slice(1),x:room.players.size?790:170,y:270,hp:100,score:0,angle:0,ws,room:room.id,lastState:0,lastHit:0};
  room.players.set(id,player);clients.set(ws,player);
  send(ws,{type:'joined',id,room:room.id,players:room.players.size,capacity:2});
  broadcast(room);
  for(const other of room.players.values())if(other.id!==id)send(other.ws,{type:'notice',text:player.name+' подключился'});
  ws.on('message',raw=>{
    if(raw.length>2048)return;
    let msg;try{msg=JSON.parse(raw.toString())}catch{return}
    if(msg.type==='state'){
      const stamp=now();
      if(stamp-player.lastState<45)return;
      player.lastState=stamp;
      player.x=number(msg.x,player.x,35,925);
      player.y=number(msg.y,player.y,35,505);
      player.angle=number(msg.angle,player.angle,-Math.PI*2,Math.PI*2);
      // The arena currently simulates bot damage on the client, so bounded HP/score
      // values are synchronized here. PvP hit damage itself is applied by the server.
      player.hp=number(msg.hp,player.hp,0,100);
      player.score=number(msg.score,player.score,0,999);
      broadcast(room);
    }
    if(msg.type==='hit'&&typeof msg.target==='string'){
      const stamp=now();
      if(stamp-player.lastHit<180)return;
      const target=room.players.get(msg.target);
      if(!target||target.id===player.id)return;
      // Reject implausible remote hits instead of trusting arbitrary client targets.
      if(Math.hypot(target.x-player.x,target.y-player.y)>650)return;
      player.lastHit=stamp;
      target.hp=Math.max(0,target.hp-10);
      if(target.hp===0){
        player.score=Math.min(999,player.score+1);
        target.hp=100;
        target.x=[...room.players.keys()].indexOf(target.id)===0?170:790;
        target.y=270;
        send(target.ws,{type:'notice',text:'Ты возродился!'});
      }
      broadcast(room);
    }
  });
  ws.on('close',()=>remove(ws));ws.on('error',()=>remove(ws));
});
const heartbeat=setInterval(()=>{
  for(const ws of wss.clients){
    if(ws.isAlive===false){remove(ws);ws.terminate();continue;}
    ws.isAlive=false;
    ws.ping();
  }
},30000);
server.on('close',()=>clearInterval(heartbeat));
server.listen(port,'0.0.0.0',()=>console.log('SABLOX server listening on '+port));
