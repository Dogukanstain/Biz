const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 3000;
app.use(express.static(path.join(__dirname, 'public')));
app.get('/healthz', (_req,res)=>res.json({ok:true,game:'Midnight Protocol'}));
const WORLD={width:960,height:640}, MAX_PLAYERS=5, SPEED=150;
const CHARACTERS={
  dogukan:{name:'Doğukan',color:'#e74a55',hair:'#39221e',skin:'#e9ad88',shirt:'#bd303d',role:'Gezgin'},
  yaren:{name:'Yaren',color:'#f2c94c',hair:'#e2b66c',skin:'#f2c5a2',shirt:'#d6a62e',role:'Kâşif'},
  aysima:{name:'Aysima',color:'#b38ae8',hair:'#4a2c36',skin:'#e8b89d',shirt:'#8e5fc5',role:'İz sürücü'},
  berken:{name:'Berken',color:'#f17db5',hair:'#49342c',skin:'#e9b99c',shirt:'#d95291',role:'Bahçıvan'},
  emre:{name:'Emre',color:'#65c982',hair:'#49352b',skin:'#dba786',shirt:'#318b53',role:'Tamirci'}
};
const spawns=[{x:465,y:325},{x:495,y:325},{x:435,y:325},{x:465,y:355},{x:495,y:355}];
const baseTasks=[{id:'A',name:'Eski kuyu',x:145,y:180,done:false},{id:'B',name:'Orman feneri',x:810,y:165,done:false},{id:'C',name:'Köy panosu',x:170,y:525,done:false},{id:'D',name:'Bahçe pompası',x:790,y:510,done:false}];
const rooms=new Map();
function cleanName(v){return String(v||'').replace(/[<>]/g,'').trim().slice(0,16)||'Gezgin'}
function cleanRoom(v){return String(v||'BAHAR').toUpperCase().replace(/[^A-Z0-9-]/g,'').slice(0,12)||'BAHAR'}
function getRoom(code){if(!rooms.has(code))rooms.set(code,{code,players:new Map(),tasks:baseTasks.map(t=>({...t}))});return rooms.get(code)}
function state(r){return {room:r.code,world:WORLD,players:[...r.players.values()].map(p=>({id:p.id,name:p.name,x:p.x,y:p.y,color:p.color,character:p.character,skin:p.skin,hair:p.hair,shirt:p.shirt,role:p.role,facing:p.facing,moving:p.moving})),tasks:r.tasks,connected:r.players.size,maxPlayers:MAX_PLAYERS}}
function broadcast(r){io.to(r.code).emit('worldState',state(r))}
const obstacles=[[0,0,960,30],[0,610,960,30],[0,0,28,640],[932,0,28,640],[310,85,130,75],[580,72,145,82],[75,285,110,70],[755,285,115,75],[315,480,130,72],[570,455,150,80]];
function blocked(x,y,r=9){return obstacles.some(([ox,oy,w,h],i)=>i===0||i===1||i===2||i===3 ? x+r>ox&&x-r<ox+w&&y+r>oy&&y-r<oy+h : x+r>ox&&x-r<ox+w&&y+r>oy&&y-r<oy+h)}
io.on('connection',socket=>{let roomCode=null;
 socket.on('joinRoom',payload=>{if(roomCode){const old=rooms.get(roomCode);if(old){old.players.delete(socket.id);socket.leave(roomCode);broadcast(old)}}
  const code=cleanRoom(payload?.room),r=getRoom(code);if(r.players.size>=MAX_PLAYERS){socket.emit('joinError','Bu oda dolu. Başka bir oda kodu seç.');return}
  let key=String(payload?.character||'dogukan').toLowerCase();if(!CHARACTERS[key])key='dogukan';
  // Avoid duplicates when possible; if all are selected, allow duplicate picks.
  const used=new Set([...r.players.values()].map(p=>p.character));if(used.has(key)){const free=Object.keys(CHARACTERS).find(k=>!used.has(k));if(free)key=free}
  const c=CHARACTERS[key],idx=r.players.size,sp=spawns[idx%spawns.length];
  const p={id:socket.id,name:c.name,x:sp.x,y:sp.y,color:c.color,character:key,skin:c.skin,hair:c.hair,shirt:c.shirt,role:c.role,facing:'down',moving:false,keys:{up:false,down:false,left:false,right:false},lastUpdate:Date.now()};
  r.players.set(socket.id,p);roomCode=code;socket.join(code);socket.emit('joined',{id:socket.id,room:code,character:key,name:p.name});broadcast(r);io.to(code).emit('systemMessage',`${p.name} köye geldi.`)
 });
 socket.on('input',v=>{if(!roomCode)return;const r=rooms.get(roomCode),p=r?.players.get(socket.id);if(!p||!v)return;p.keys={up:!!v.up,down:!!v.down,left:!!v.left,right:!!v.right};if(['up','down','left','right'].includes(v.facing))p.facing=v.facing;p.moving=Object.values(p.keys).some(Boolean)});
 socket.on('interact',()=>{if(!roomCode)return;const r=rooms.get(roomCode),p=r?.players.get(socket.id);if(!p)return;const t=r.tasks.find(t=>!t.done&&Math.hypot(t.x-p.x,t.y-p.y)<52);if(!t){socket.emit('systemMessage','Görev noktasına biraz daha yaklaş.');return}t.done=true;io.to(roomCode).emit('systemMessage',`${p.name}, ${t.name} görevini tamamladı!`);if(r.tasks.every(t=>t.done))io.to(roomCode).emit('missionComplete','Köy yeniden canlandı! Tüm görevler tamamlandı.');broadcast(r)});
 socket.on('disconnect',()=>{if(!roomCode)return;const r=rooms.get(roomCode);if(r){const p=r.players.get(socket.id);r.players.delete(socket.id);if(p)io.to(roomCode).emit('systemMessage',`${p.name} köyden ayrıldı.`);broadcast(r);if(!r.players.size)rooms.delete(roomCode)}})
});
setInterval(()=>{const now=Date.now();for(const r of rooms.values()){for(const p of r.players.values()){const dt=Math.min((now-p.lastUpdate)/1000,.05);p.lastUpdate=now;let dx=(p.keys.right?1:0)-(p.keys.left?1:0),dy=(p.keys.down?1:0)-(p.keys.up?1:0);if(dx&&dy){dx*=.7071;dy*=.7071}const nx=Math.max(36,Math.min(924,p.x+dx*SPEED*dt)),ny=Math.max(40,Math.min(595,p.y+dy*SPEED*dt));if(!blocked(nx,p.y,8))p.x=nx;if(!blocked(p.x,ny,8))p.y=ny;p.moving=!!(dx||dy)}broadcast(r)}},50);
server.listen(PORT,'0.0.0.0',()=>console.log(`Midnight Protocol running on ${PORT}`));
