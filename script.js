(function () {
  'use strict';

  /* --- SPLASH LOADER --- */
  (function splashInit() {
    const STAR_COUNT = 30;
    const LOAD_MS = 1500;

    function createSplashStars() {
  const container = document.getElementById('splash-stars');
  if (!container) return;
  container.innerHTML = '';
  
  const STAR_COUNT = 40; // Un poco más de gemas para llenar la pantalla

  for (let i = 0; i < STAR_COUNT; i++) {
    const s = document.createElement('div');
    s.className = 'splash-star';
    s.textContent = '💎';
    
    // Dispersión aleatoria por TODA la pantalla
    const randomX = Math.floor(Math.random() * 100);
    const randomY = Math.floor(Math.random() * 100);
    
    s.style.left = randomX + '%';
    s.style.top = randomY + '%';
    
    // Variedad de tamaños y velocidades
    const size = 10 + Math.random() * 25;
    const duration = 3 + Math.random() * 5;
    const delay = Math.random() * 2;
    
    s.style.fontSize = size + 'px';
    s.style.animationDuration = duration + 's';
    s.style.animationDelay = delay + 's';
    s.style.opacity = (0.4 + Math.random() * 0.6).toFixed(2);
    
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
    const prizes = [{label:'100% DE BONO + 1000 FICHAS'}, {label:'150% DE BONO + 1000 FICHAS'}, {label:'200% DE BONO + 1000 FICHAS'}];
    const assigned = prizes.sort(() => Math.random() - 0.5);
    localStorage.setItem(ASSIGN_KEY, JSON.stringify({date:today, assignments:assigned}));
    return assigned;
  }

  /* --- UI SETUP: DIBUJO DE LOS 3 DIAMANTES --- */
  function setupDiamonds() {
    const svgs = document.querySelectorAll('.diamond-svg');
    
    // Geometría detallada del diamante (Facetas)
    const diamondHTML = `
        <g transform="translate(0, 5)">
            <path class="f-mid" d="M 20 45 L 60 105 L 40 45 Z" />
            <path class="f-base" d="M 40 45 L 60 105 L 80 45 Z" />
            <path class="f-mid" d="M 80 45 L 60 105 L 100 45 Z" />
            <path class="f-dark" d="M 10 45 L 60 105 L 20 45 Z" />
            <path class="f-dark" d="M 110 45 L 60 105 L 100 45 Z" />
            <path class="f-light" d="M 30 15 L 90 15 L 100 45 L 20 45 L 10 45 Z" />
            <path class="f-base" d="M 30 15 L 90 15 L 80 45 L 40 45 Z" />
            <path class="f-light" d="M 30 15 L 40 45 L 20 45 Z" />
            <path class="f-light" d="M 90 15 L 100 45 L 80 45 Z" />
            <path class="f-shine" d="M 25 25 L 32 30 L 25 35 L 18 30 Z" />
        </g>
    `;

    svgs.forEach(svg => {
      svg.innerHTML = diamondHTML;
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
      const prizeText = document.getElementById('prize-text');
      if(prizeText) prizeText.textContent = selection.prize.label;
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

  /* --- CANVAS FONDO (AMBIENTE CUEVA) --- */
  const canvas = document.getElementById('sky');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let w, h;
    const resize = () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; };
    window.addEventListener('resize', resize);
    resize();
    const stars = Array.from({length: 80}, () => ({ x: Math.random()*w, y: Math.random()*h, r: Math.random()*2, o: Math.random() }));
    const draw = () => {
      // Usamos el color de fondo de la cueva profunda
      ctx.fillStyle = '#020811'; 
      ctx.fillRect(0,0,w,h);
      stars.forEach(s => {
        ctx.fillStyle = `rgba(179, 229, 252, ${s.o})`;
        ctx.beginPath(); 
        // Dibujamos pequeños cristales (rombos) en vez de círculos
        ctx.moveTo(s.x, s.y - s.r);
        ctx.lineTo(s.x + s.r, s.y);
        ctx.lineTo(s.x, s.y + s.r);
        ctx.lineTo(s.x - s.r, s.y);
        ctx.fill();
        s.o += (Math.random()-0.5)*0.02;
        s.o = Math.max(0.1, Math.min(0.7, s.o));
      });
      requestAnimationFrame(draw);
    };
    draw();
  }
})();
