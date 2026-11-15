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
const server = http.createServer((req,res) => {
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname === '/api/health') {
    res.writeHead(200, {'Content-Type':'application/json','Cache-Control':'no-store'});
    return res.end(JSON.stringify({status:'ok',service:'SABLOX',version:'0.2.0',online:clients.size,rooms:rooms.size}));
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
const wss = new WebSocketServer({server,path:'/ws'});
function send(ws,data){if(ws.readyState===1)ws.send(JSON.stringify(data))}
function snapshot(room){return {type:'state',room:room.id,players:[...room.players.values()].map(p=>({id:p.id,name:p.name,x:p.x,y:p.y,hp:p.hp,score:p.score,angle:p.angle}))}}
function broadcast(room){const data=snapshot(room);for(const p of room.players.values())send(p.ws,data)}
function remove(ws){
  const p=clients.get(ws);if(!p)return;clients.delete(ws);
  const room=rooms.get(p.room);if(room){room.players.delete(p.id);for(const other of room.players.values())send(other.ws,{type:'notice',text:p.name+' покинул матч'});if(!room.players.size)rooms.delete(room.id);else broadcast(room)}
}
wss.on('connection',ws=>{
  const id='p'+nextId++;const roomId='arena-'+Math.ceil(nextId/3);
  let room=[...rooms.values()].find(r=>r.players.size<2);
  if(!room){room={id:roomId,players:new Map()};rooms.set(room.id,room)}
  const player={id,name:'Игрок '+id.slice(1),x:room.players.size?790:170,y:270,hp:100,score:0,angle:0,ws,room:room.id};
  room.players.set(id,player);clients.set(ws,player);
  send(ws,{type:'joined',id,room:room.id,players:room.players.size,capacity:2});
  broadcast(room);
  for(const other of room.players.values())if(other.id!==id)send(other.ws,{type:'notice',text:player.name+' подключился'});
  ws.on('message',raw=>{
    if(raw.length>2048)return;
    let msg;try{msg=JSON.parse(raw.toString())}catch{return}
    if(msg.type==='state'){
      player.x=Math.max(35,Math.min(925,Number(msg.x)||player.x));
      player.y=Math.max(35,Math.min(505,Number(msg.y)||player.y));
      player.angle=Number.isFinite(msg.angle)?msg.angle:player.angle;
      player.hp=Math.max(0,Math.min(100,Number(msg.hp)||0));
      player.score=Math.max(0,Math.min(999,Number(msg.score)||0));
      broadcast(room);
    }
    if(msg.type==='hit'&&typeof msg.target==='string'){
      const target=room.players.get(msg.target);
      if(target&&target.id!==player.id){target.hp=Math.max(0,target.hp-10);if(target.hp===0){player.score++;target.hp=100;target.x=target.id=== [...room.players.keys()][0]?170:790;target.y=270}broadcast(room)}
    }
  });
  ws.on('close',()=>remove(ws));ws.on('error',()=>remove(ws));
});
server.listen(port,'0.0.0.0',()=>console.log('SABLOX server listening on '+port));
