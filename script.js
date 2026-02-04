const player=document.getElementById("player");
const world=document.getElementById("world");
const overlay=document.getElementById("overlay");

let playerX=100,playerY=80,vy=0,speed=4,gravity=0.8,jump=14;
let grounded=false,dead=false;
let camX=0;
const SCREEN_W=800, WORLD_W=4000;
const keys={left:false,right:false,up:false};

let level=0;
const levels=[
  {
    ground:[[0,800],[900,800],[1800,800],[2600,800]],
    platforms:[[500,220],[1200,260],[2000,180]],
    traps:[[750,80],[1600,80]],
    enemies:[[1000,80],[2200,80]]
  },
  {
    ground:[[0,800],[900,800],[1800,800],[2800,800]],
    platforms:[[600,200],[1400,260],[2100,200]],
    traps:[[950,80],[1800,80]],
    enemies:[[1300,80],[2400,80]]
  }
];

function loadLevel(lv){
  world.innerHTML='';
  world.appendChild(player);
  const L = levels[lv];
  
  L.ground.forEach(g=>{
    const d=document.createElement('div');
    d.className='ground';
    d.style.left=g[0]+'px';
    d.style.width=g[1]-g[0]+'px';
    world.appendChild(d);
  });
  L.platforms.forEach(p=>{
    const d=document.createElement('div');
    d.className='platform';
    d.style.left=p[0]+'px';
    d.style.bottom=p[1]+'px';
    world.appendChild(d);
  });
  L.traps.forEach(t=>{
    const d=document.createElement('div');
    d.className='trap';
    d.style.left=t[0]+'px';
    d.style.bottom=t[1]+'px';
    if(Math.random()<0.5)d.classList.add('move');
    world.appendChild(d);
  });
  L.enemies.forEach(e=>{
    const d=document.createElement('div');
    d.className='enemy move';
    d.style.left=e[0]+'px';
    d.style.bottom=e[1]+'px';
    world.appendChild(d);
  });
  
  playerX=100; playerY=80; vy=0; camX=0; dead=false;
  overlay.style.display='none';
  world.classList.remove('shake');
}

loadLevel(level);

function rect(el){
  return el.getBoundingClientRect();
}

function update(){
  if(dead) return;

  if(keys.left) playerX-=speed;
  if(keys.right) playerX+=speed;
  if(keys.up && grounded){vy=jump; grounded=false;}

  vy-=gravity;
  playerY+=vy;
  if(playerY<=80){playerY=80;vy=0;grounded=true;}
  if(playerY<-200) die();

  playerX=Math.max(0,Math.min(playerX,WORLD_W-32));

  camX = playerX - SCREEN_W/2;
  camX = Math.max(0,Math.min(camX,WORLD_W-SCREEN_W));

  world.style.transform=`translateX(${-camX}px)`;
  player.style.left=playerX+'px';
  player.style.bottom=playerY+'px';

  // فخاخ + أعداء
  document.querySelectorAll('.trap, .enemy').forEach(obj=>{
    const a=player.getBoundingClientRect();
    const b=obj.getBoundingClientRect();
    if(a.left<a.right && b.left<b.right && a.right>b.left && a.left<b.right && a.bottom>b.top && a.top<b.bottom){
      die();
    }
  });

  requestAnimationFrame(update);
}
update();

function die(){
  dead=true;
  overlay.style.display='flex';
  world.classList.add('shake');
  setTimeout(()=>loadLevel(level),1500);
}

/* تحكم */
function bind(id,key){
  const b=document.getElementById(id);
  b.onmousedown=()=>keys[key]=true;
  b.onmouseup=()=>keys[key]=false;
  b.ontouchstart=e=>{e.preventDefault();keys[key]=true};
  b.ontouchend=()=>keys[key]=false;
}
bind('left','left'); bind('right','right'); bind('up','up');
document.addEventListener('keydown',e=>{
  if(e.key==='ArrowLeft') keys.left=true;
  if(e.key==='ArrowRight') keys.right=true;
  if(e.key==='ArrowUp'||e.key===' ') keys.up=true;
});
document.addEventListener('keyup',e=>{
  if(e.key==='ArrowLeft') keys.left=false;
  if(e.key==='ArrowRight') keys.right=false;
  if(e.key==='ArrowUp'||e.key===' ') keys.up=false;
});