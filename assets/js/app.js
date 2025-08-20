/* assets/js/app.js */
/* Common JS for all pages */
const TARGET_ISO = '2025-12-16T23:59:00+05:30'; 
const PASSWORD_PLAIN = null; // optional plain password
const PASSWORD_HASH = '448ab0a6107f4a6db4aa405ac7def36fc65d30f41d995cfebac1131a5bb7bc96'; // SHA-256 hex

/* util: hash text -> hex */
async function sha256hex(message){
  const enc = new TextEncoder();
  const data = enc.encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2,'0')).join('');
}

/* Check unlocked flag */
function isUnlocked(){
  try{
    return localStorage.getItem('unlocked') === 'true';
  }catch(e){ return false; }
}

/* Redirect to login if not unlocked */
function guardPage(){
  if(!isUnlocked()){
    window.location.href = 'index.html';
  }
}

/* Unlock flow */
async function checkPassword(input){
  if(PASSWORD_PLAIN) return input === PASSWORD_PLAIN;
  if(PASSWORD_HASH && PASSWORD_HASH !== 'REPLACE_WITH_HASH'){
    const h = await sha256hex(input);
    return h === PASSWORD_HASH;
  }
  return input === 'secret'; // fallback demo
}

/* Countdown */
function startCountdown(onTick, onEnd){
  const target = new Date(TARGET_ISO);
  function tick(){
    const now = new Date();
    const diff = target - now;
    if(diff <= 0){
      onTick && onTick(0,0,0,0,0);
      onEnd && onEnd();
      clearInterval(interval);
      return;
    }
    const days = Math.floor(diff/ (1000*60*60*24));
    const hours = Math.floor(diff/ (1000*60*60) ) % 24;
    const minutes = Math.floor(diff/ (1000*60) ) % 60;
    const seconds = Math.floor(diff/1000) % 60;
    onTick(diff, days, hours, minutes, seconds);
    if(diff <= 60000) startSpecial60();
  }
  tick();
  const interval = setInterval(tick, 1000);
  return () => clearInterval(interval);
}

/* hearts animation */
function spawnHearts(num=12){
  const decor = document.querySelector('.decor');
  if(!decor) return;
  for(let i=0;i<num;i++){
    const el = document.createElement('div');
    el.className = 'heart';
    el.style.left = (Math.random()*100) + 'vw';
    el.style.top = (60 + Math.random()*30) + 'vh';
    el.style.setProperty('--tx', ((Math.random()*200)-100)+'px');
    const img = document.createElement('img');
    img.src = 'assets/images/heart1.png';
    el.appendChild(img);
    el.style.animationDuration = (6 + Math.random()*6) + 's';
    el.style.opacity = 0.95;
    decor.appendChild(el);
    setTimeout(()=> el.remove(), 14000);
  }
}

/* confetti */
function startConfetti(){
  if(document.getElementById('confettiCanvas')) return;
  const c = document.createElement('canvas'); c.id = 'confettiCanvas';
  c.style.position='fixed'; c.style.left=0; c.style.top=0; c.style.width='100%'; c.style.height='100%';
  c.style.pointerEvents='none'; c.width = window.innerWidth; c.height = window.innerHeight;
  document.body.appendChild(c);
  const ctx = c.getContext('2d');
  let pieces = [];
  for(let i=0;i<150;i++){
    pieces.push({
      x: Math.random()*c.width,
      y: Math.random()*c.height - c.height,
      w: 6 + Math.random()*8,
      h: 8 + Math.random()*10,
      vx: -3 + Math.random()*6,
      vy: 2 + Math.random()*6,
      color: ['#ff6fa3','#ffd166','#ff9ccf','#ffd9e6'][Math.floor(Math.random()*4)],
      rot: Math.random()*360
    });
  }
  function loop(){
    ctx.clearRect(0,0,c.width,c.height);
    pieces.forEach(p=>{
      p.x += p.vx; p.y += p.vy; p.rot += (p.vx*0.2);
      ctx.save();
      ctx.translate(p.x,p.y);
      ctx.rotate(p.rot*Math.PI/180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w/2,-p.h/2,p.w,p.h);
      ctx.restore();
      if(p.y > c.height + 50) { p.y = -50; p.x = Math.random()*c.width; }
    });
    requestAnimationFrame(loop);
  }
  loop();
  setTimeout(()=> c.remove(), 12000);
}

/* last 60 sec special animation */
let specialStarted = false;
function startSpecial60(){
  if(specialStarted) return;
  specialStarted = true;
  spawnHearts(30);
  startConfetti();
  const hero = document.querySelector('.hero-title');
  if(hero){
    hero.style.transition = 'transform 0.6s ease';
    hero.style.transform = 'scale(1.08)';
    setTimeout(()=> hero.style.transform = 'scale(1)', 300);
    setInterval(()=> {
      hero.style.transform = 'scale(1.08)';
      setTimeout(()=> hero.style.transform = 'scale(1)', 400);
    }, 1200);
  }
}

/* Index page init */
function initIndexPage(){
  spawnHearts(8);
  setInterval(()=> spawnHearts(6), 3500);

  startCountdown((diff, d, h, m, s)=>{
    const ds = document.getElementById('days'); 
    const hs = document.getElementById('hours');
    const ms = document.getElementById('mins'); 
    const ss = document.getElementById('secs');
    if(ds) ds.textContent = String(d).padStart(2,'0');
    if(hs) hs.textContent = String(h).padStart(2,'0');
    if(ms) ms.textContent = String(m).padStart(2,'0');
    if(ss) ss.textContent = String(s).padStart(2,'0');
  });

  const btn = document.getElementById('pw-submit');
  const input = document.getElementById('pw-input');
  btn && btn.addEventListener('click', async ()=>{
    const val = input.value.trim();
    if(!val) return alert('Enter password');
    const ok = await checkPassword(val);
    if(ok){
      localStorage.setItem('unlocked','true');
      startConfetti();
      setTimeout(()=> window.location.href='home.html', 900);
    } else {
      alert('Password incorrect 😔');
    }
  });

  // disable direct home.html visit from index click
  document.querySelector('.nav a').addEventListener('click', e=>{
    e.preventDefault();
    alert('Please enter the password first 💌');
  });
}

/* Protected pages init */
function initProtectedPage(){
  guardPage();
  spawnHearts(6);
}

/* Home page */
function initHomePage(){
  initProtectedPage();
  const cakeWrap = document.querySelector('.cake');
  const cutBtn = document.getElementById('cut-btn');
  cutBtn && cutBtn.addEventListener('click', ()=>{
    cakeWrap.classList.add('cut');
    try{
      const aud = document.getElementById('cut-audio');
      aud && aud.play();
    }catch(e){}
    startConfetti();
    spawnHearts(20);
    document.querySelectorAll('.blessing-line').forEach((el,i)=>{
      setTimeout(()=> el.classList.add('visible'), 600 + i*500);
    });
  });
  startFireworks();
}

/* Fireworks canvas */
function startFireworks(){
  if(document.getElementById('fwCanvas')) return;
  const c = document.createElement('canvas'); c.id='fwCanvas';
  c.style.position='fixed'; c.style.left=0; c.style.top=0; c.style.width='100%'; c.style.height='100%';
  c.style.pointerEvents='none'; document.body.appendChild(c);
  c.width = window.innerWidth; c.height = window.innerHeight;
  const ctx = c.getContext('2d');
  let parts = [];
  function addFire(x,y){
    let colors = ['#ffd166','#ff6fa3','#ff9ccf','#fff1b6'];
    for(let i=0;i<30;i++){
      parts.push({
        x,y,
        vx: (Math.random()-0.5)*6,
        vy: (Math.random()-1.5)*6,
        life: 40 + Math.random()*30,
        color: colors[Math.floor(Math.random()*colors.length)]
      });
    }
  }
  setInterval(()=> addFire(Math.random()*c.width*0.8+c.width*0.1, Math.random()*c.height*0.4+50), 3000);
  function loop(){
    ctx.clearRect(0,0,c.width,c.height);
    parts.forEach((p,i)=>{
      p.x += p.vx; p.y += p.vy; p.vy += 0.08;
      p.life--;
      ctx.globalAlpha = Math.max(0, p.life/80);
      ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.arc(p.x,p.y, 2.5, 0, Math.PI*2); ctx.fill();
      if(p.life <= 0) parts.splice(i,1);
    });
    requestAnimationFrame(loop);
  }
  loop();
  setTimeout(()=> c.remove(), 30000);
}

/* Gallery */
function initGallery(){
  initProtectedPage();
  document.querySelectorAll('.card-img').forEach(card=>{
    card.addEventListener('click', ()=>{
      const img = card.querySelector('img');
      const caption = card.getAttribute('data-caption') || '';
      const date = card.getAttribute('data-date') || '';
      const modal = document.querySelector('.modal');
      modal.querySelector('img').src = img.src;
      modal.querySelector('.meta .cap').textContent = caption;
      modal.querySelector('.meta .date').textContent = date;
      modal.classList.add('open');
    });
  });
  document.querySelectorAll('.modal, .modal .close-btn').forEach(el=>{
    el.addEventListener('click', (e)=>{
      if(e.target.classList.contains('inner')) return;
      if(e.target.closest('.inner')) return;
      document.querySelector('.modal').classList.remove('open');
    });
  });
}

/* Songs page */
function initSongs(){
  initProtectedPage();
  document.querySelectorAll('audio[data-track]').forEach(aud=>{
    const playBtn = aud.parentElement.querySelector('.play-btn');
    playBtn && playBtn.addEventListener('click', ()=>{
      if(aud.paused){
        document.querySelectorAll('audio').forEach(x=> x.pause());
        aud.play();
        playBtn.textContent = 'Pause';
      } else {
        aud.pause(); playBtn.textContent = 'Play';
      }
      aud.onended = ()=> playBtn.textContent = 'Play';
    });
  });
}

/* About page */
function initAbout(){ initProtectedPage(); }

/* DOM ready routing */
document.addEventListener('DOMContentLoaded', ()=>{
  const id = document.body.id;
  if(id === 'page-index') initIndexPage();
  if(id === 'page-home') initHomePage();
  if(id === 'page-queen') initGallery();
  if(id === 'page-memories') initGallery();
  if(id === 'page-songs') initSongs();
  if(id === 'page-about') initAbout();
});

/* Helper for generating SHA-256 in console */
window.printPasswordHash = async (plain) => {
  const h = await sha256hex(plain);
  console.log('SHA-256 hex ->', h);
  return h;
};
