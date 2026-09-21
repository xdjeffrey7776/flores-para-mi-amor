'use strict';
(() => {
  const receive = document.getElementById('receive');
  const readLetter = document.getElementById('read-letter');
  const letter = document.getElementById('letter');
  const closeLetter = document.getElementById('close-letter');
  const done = document.getElementById('letter-done');
  const sparkles = document.getElementById('sparkles');
  const announcement = document.getElementById('announcement');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const secrets = [
    'Me gustas tú. Así, sin más. En tus días de sol y también en los nublados.',
    'De todos los lugares del mundo, mi favorito siempre será a tu lado.',
    'Tienes esa forma tan tuya de hacer que un día cualquiera se vuelva bonito.',
    'Si cada vez que pienso en ti naciera una flor, ya tendría un jardín infinito.',
    'No sé qué nos espera mañana. Pero sé con quién quiero descubrirlo: contigo.'
  ];
  const memories = [];
  const seenSecrets = new Set();
  let memoryIndex = 0;
  let lastLetterTrigger = readLetter;
  let received = false;
  let scrollPosition = 0;

  const musicDock = document.getElementById('music-dock');
  const musicToggle = document.getElementById('music-toggle');
  const musicPanel = document.getElementById('music-panel');
  function setMusicExpanded(expanded) {
    musicDock.classList.toggle('is-collapsed', !expanded);
    musicToggle.setAttribute('aria-expanded', String(expanded));
    musicToggle.setAttribute('aria-label', expanded ? 'Minimizar el reproductor de Spotify' : 'Mostrar el reproductor de her, de JVKE');
    musicPanel.inert = !expanded;
    musicPanel.setAttribute('aria-hidden', String(!expanded));
    document.getElementById('music-label').textContent = expanded ? 'Una canción para ti' : 'her · JVKE';
    document.querySelector('.music-toggle-icon').textContent = expanded ? '−' : '+';
  }
  setMusicExpanded(!window.matchMedia('(max-width: 700px)').matches);
  musicToggle.addEventListener('click', () => setMusicExpanded(musicToggle.getAttribute('aria-expanded') !== 'true'));

  function celebrate() {
    if (reducedMotion.matches) return;
    sparkles.replaceChildren();
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < 28; i++) {
      const spark = document.createElement('span');
      spark.className = 'spark';
      spark.textContent = i % 3 === 0 ? '♡' : '✦';
      spark.style.setProperty('--x', `${Math.random() * 100}%`);
      spark.style.setProperty('--size', `${12 + Math.random() * 15}px`);
      spark.style.setProperty('--duration', `${4 + Math.random() * 3}s`);
      spark.style.setProperty('--delay', `${Math.random() * 1.4}s`);
      spark.style.setProperty('--drift', `${Math.random() * 100 - 50}px`);
      spark.style.setProperty('--rotation', `${Math.random() * 70 - 35}deg`);
      fragment.append(spark);
    }
    sparkles.append(fragment);
    window.setTimeout(() => sparkles.replaceChildren(), 9000);
  }

  receive.addEventListener('click', () => {
    if (received) return;
    received = true;
    document.body.classList.add('received');
    receive.hidden = true;
    readLetter.hidden = false;
    document.getElementById('gift-caption').textContent = 'Y todavía me falta decirte algo…';
    document.getElementById('gift-result').hidden = false;
    document.getElementById('flower-secrets').hidden = false;
    document.getElementById('gift-caption').textContent = 'Toca los corazones del ramo. Escondí algo para ti.';
    readLetter.focus({ preventScroll: true });
    celebrate();
  });

  function openLetter(event) {
    lastLetterTrigger = event.currentTarget;
    scrollPosition = window.scrollY;
    letter.showModal();
    letter.scrollTop = 0;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollPosition}px`;
    document.body.style.width = '100%';
    closeLetter.focus({ preventScroll: true });
  }
  readLetter.addEventListener('click', openLetter);
  document.getElementById('memories-letter').addEventListener('click', openLetter);

  document.querySelectorAll('[data-secret]').forEach(button => {
    button.addEventListener('click', () => {
      const index = Number(button.dataset.secret);
      seenSecrets.add(index);
      button.setAttribute('aria-pressed', 'true');
      button.textContent = '♥';
      document.getElementById('secret-number').textContent = `UN PEDACITO DE MI CORAZÓN · ${index + 1} DE ${secrets.length}`;
      document.getElementById('secret-text').textContent = secrets[index];
      const note = document.getElementById('secret-note');
      note.hidden = false;
      if (!reducedMotion.matches) note.animate([{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 400, easing: 'ease-out' });
      document.getElementById('gift-caption').textContent = seenSecrets.size === secrets.length ? 'Encontraste todos mis mensajes. Ahora, tu cartita. ♡' : `${seenSecrets.size} de ${secrets.length} mensajitos descubiertos. Todos son para ti.`;
      if (seenSecrets.size === secrets.length) celebrate();
    });
  });

  function renderMemory() {
    const memory = memories[memoryIndex];
    if (!memory) return;
    const photo = document.getElementById('memory-image');
    photo.src = memory.src;
    photo.alt = memory.alt || 'Un recuerdo de nosotros dos';
    document.getElementById('memory-caption').textContent = memory.caption;
    document.getElementById('memory-counter').textContent = `${memoryIndex + 1} / ${memories.length}`;
  }
  if (memories.length) {
    document.getElementById('memories').hidden = false;
    document.getElementById('view-memories').hidden = false;
    document.getElementById('view-memories').addEventListener('click', () => document.getElementById('memories').scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth' }));
    document.getElementById('previous-memory').addEventListener('click', () => { memoryIndex = (memoryIndex - 1 + memories.length) % memories.length; renderMemory(); });
    document.getElementById('next-memory').addEventListener('click', () => { memoryIndex = (memoryIndex + 1) % memories.length; renderMemory(); });
    const photo = document.querySelector('.memory-photo');
    let touchStartX = null;
    photo.addEventListener('touchstart', event => { touchStartX = event.changedTouches[0].screenX; }, { passive: true });
    photo.addEventListener('touchend', event => {
      if (touchStartX === null) return;
      const delta = event.changedTouches[0].screenX - touchStartX;
      touchStartX = null;
      if (Math.abs(delta) < 45) return;
      memoryIndex = (memoryIndex + (delta < 0 ? 1 : -1) + memories.length) % memories.length;
      renderMemory();
    }, { passive: true });
    renderMemory();
  }

  function dismissLetter() { letter.close(); }
  closeLetter.addEventListener('click', dismissLetter);
  done.addEventListener('click', () => {
    letter.close();
    document.getElementById('gift-caption').textContent = 'Vuelve cuando quieras. Estas flores siempre serán tuyas.';
    announcement.textContent = 'Te quiero. Hoy, mañana y en todas las primaveras.';
    celebrate();
  });
  letter.addEventListener('click', event => {
    const rect = letter.getBoundingClientRect();
    if (event.target === letter && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dismissLetter();
  });
  letter.addEventListener('close', () => {
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    const previousBehavior = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = 'auto';
    window.scrollTo(0, scrollPosition);
    document.documentElement.style.scrollBehavior = previousBehavior;
    lastLetterTrigger.focus({ preventScroll: true });
  });
})();
