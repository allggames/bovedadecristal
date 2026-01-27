(function () {
  'use strict';

  /* --- GEOMETRÍA DEL DIAMANTE --- */
  function makeDiamondPath(cx, cy, w, h) {
    // Un diamante es un rombo simple pero elegante
    return `M ${cx} ${cy - h/2} L ${cx + w/2} ${cy} L ${cx} ${cy + h/2} L ${cx - w/2} ${cy} Z`;
  }

  /* --- SPLASH LOADER --- */
  (function splashInit() {
    const STAR_COUNT = 30;
    const LOAD_MS = 1500;

    function createSplashStars() {
      const container = document.getElementById('splash-stars');
      if (!container) return;
      container.innerHTML = '';
      for (let i=0; i<STAR_COUNT; i++){
        const s = document.createElement('div');
        s.className = 'splash-star';
        s.textContent = '💎'; // Ahora diamantes en el splash
        s.style.left = (Math.random() * 100) + '%';
        s.style.top = (Math.random() * 100) + '%';
        s.style.fontSize = (10 + Math.random()*20) + 'px';
        s.style.animationDuration = (4 + Math.random()*4) + 's';
        s.style.opacity = Math.random();
        container.appendChild(s);
      }
    }

    function runLoaderThenHide() {
      const progress = document.getElementById('loading-progress');
      const splash = document.getElementById('splash');
      if (!progress || !splash) return;
      const start = performance.now();
      function tick(now) {
        const t = Math.min(1, (now - start) / LOAD_MS);
        progress.style.width = (t * 100) + '%';
        if (t < 1) requestAnimationFrame(tick);
        else {
          setTimeout(() => {
            splash.classList.add('hidden');
            const logo = document.getElementById('logo');
            const container = document.getElementById('bottom-logo-container');
            if (logo && container) {
              logo.classList.remove('hide-until-bottom');
              container.appendChild(logo);
            }
          }, 300);
        }
      }
      requestAnimationFrame(tick);
    }

    document.addEventListener('DOMContentLoaded', () => {
      createSplashStars();
      runLoaderThenHide();
    });
  })();

  /* --- LÓGICA DE PREMIOS --- */
  const ASSIGN_KEY = 'diamonds.assignments';
  const SELECT_KEY = 'diamonds.selection';
  const todayKey = () => new Date().toISOString().slice(0,10);

  function loadOrCreateAssignments(count) {
    const today = todayKey();
    const raw = localStorage.getItem(ASSIGN_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.date === today) return parsed.assignments;
    }
    const prizes = [{label:'100% de Bono'}, {label:'150% de Bono'}, {label:'200% de Bono'}];
    const assigned = prizes.sort(() => Math.random() - 0.5);
    localStorage.setItem(ASSIGN_KEY, JSON.stringify({date:today, assignments:assigned}));
    return assigned;
  }

  /* --- UI SETUP --- */
  function setupDiamonds() {
  const svgs = document.querySelectorAll('.diamond-svg');
  
  // Coordenadas para un diamante de estilo "brillante"
  // Puntos: Top-Left (30,40), Top-Right (90,40), Bottom (60,100), etc.
  const drawDiamond = `
    <path class="facet" d="M 30 40 L 60 100 L 60 40 Z" fill="#29b6f6" />
    <path class="facet-side" d="M 90 40 L 60 100 L 60 40 Z" />
    <path class="facet" d="M 15 40 L 60 100 L 30 40 Z" fill="#0288d1" />
    <path class="facet" d="M 105 40 L 60 100 L 90 40 Z" fill="#0288d1" />
    
    <path class="facet-top" d="M 30 40 L 90 40 L 75 20 L 45 20 Z" />
    <path class="facet-side" d="M 15 40 L 30 40 L 45 20 Z" />
    <path class="facet-side" d="M 105 40 L 90 40 L 75 20 Z" />
    
    <path class="facet-shine" d="M 35 25 L 45 25 L 40 35 Z" />
  `;

  containers.forEach(container => {
    container.innerHTML = drawDiamond;
  });
}

  function explodeConfetti() {
    const container = document.getElementById('confetti');
    if (!container) return;
    const emojis = ["💎", "✨", "❄️", "💠", "💙"];
    for (let i = 0; i < 30; i++) {
      const el = document.createElement('div');
      el.textContent = emojis[Math.floor(Math.random()*emojis.length)];
      el.style.position = 'fixed';
      el.style.left = '50%';
      el.style.top = '50%';
      el.style.fontSize = '24px';
      container.appendChild(el);
      const angle = Math.random() * Math.PI * 2;
      const dist = 100 + Math.random() * 200;
      el.animate([
        { transform: 'translate(-50%, -50%) scale(0)', opacity: 1 },
        { transform: `translate(${Math.cos(angle)*dist}px, ${Math.sin(angle)*dist}px) scale(1.5)`, opacity: 0 }
      ], { duration: 1000, easing: 'ease-out' }).onfinish = () => el.remove();
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    setupDiamonds();
    const buttons = document.querySelectorAll('.star');
    const assignments = loadOrCreateAssignments(buttons.length);
    const selection = JSON.parse(localStorage.getItem(SELECT_KEY));
    let locked = selection && selection.date === todayKey();

    if (locked) {
      document.getElementById('prize-text').textContent = selection.prize.label;
      document.getElementById('result').classList.remove('hidden');
      document.getElementById('result').classList.add('show');
    }

    buttons.forEach((btn, idx) => {
      btn.addEventListener('click', () => {
        if (locked) return;
        locked = true;
        btn.classList.add('pop', 'flip');
        const audio = document.getElementById('claim-sound');
        if (audio) audio.play().catch(() => {});
        
        setTimeout(() => {
          const prize = assignments[idx];
          localStorage.setItem(SELECT_KEY, JSON.stringify({date:todayKey(), prize}));
          document.getElementById('prize-text').textContent = prize.label;
          document.getElementById('result').classList.remove('hidden');
          document.getElementById('result').classList.add('show');
          explodeConfetti();
        }, 700);
      });
    });

    document.getElementById('close-btn').addEventListener('click', () => {
      document.getElementById('result').classList.remove('show');
      setTimeout(() => document.getElementById('result').classList.add('hidden'), 300);
    });

    setTimeout(() => document.body.classList.remove('dropping'), 100);
  });

  /* --- CANVAS FONDO (ESTRELLAS LEJANAS) --- */
  const canvas = document.getElementById('sky');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let w, h;
    const resize = () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; };
    window.addEventListener('resize', resize);
    resize();
    const stars = Array.from({length: 100}, () => ({ x: Math.random()*w, y: Math.random()*h, r: Math.random()*1.5, o: Math.random() }));
    const draw = () => {
      ctx.clearRect(0,0,w,h);
      stars.forEach(s => {
        ctx.fillStyle = `rgba(179, 229, 252, ${s.o})`;
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI*2); ctx.fill();
        s.o += (Math.random()-0.5)*0.05;
        s.o = Math.max(0.1, Math.min(1, s.o));
      });
      requestAnimationFrame(draw);
    };
    draw();
  }
})();
