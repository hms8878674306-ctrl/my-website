/* ============================================
   Interactions — Since counter, letter, runaway btn
   ============================================ */

/* The day you started talking — April 20, 2026 */
const START_DATE = new Date(2026, 3, 20, 0, 0, 0);

document.addEventListener("DOMContentLoaded", () => {
  initMobileNav();
  initSinceCounter();
  initSorryReveal();
  initRunawayButton();
  initFadeIn();
  initTyping();
});

/* Mobile nav */
function initMobileNav() {
  const toggle = document.querySelector(".navbar__toggle");
  const links = document.querySelector(".navbar__links");
  if (!toggle || !links) return;

  toggle.addEventListener("click", () => {
    links.classList.toggle("open");
    toggle.textContent = links.classList.contains("open") ? "✕" : "☰";
  });

  links.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      links.classList.remove("open");
      toggle.textContent = "☰";
    });
  });
}

/* Count UP since April 20, 2026 */
function initSinceCounter() {
  const el = document.getElementById("since-counter");
  if (!el) return;

  function update() {
    const now = new Date();
    const diff = now - START_DATE;

    if (diff < 0) {
      el.innerHTML = '<p class="since-section__label">Our story begins soon...</p>';
      return;
    }

    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff / 3600000) % 24);
    const minutes = Math.floor((diff / 60000) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    document.getElementById("days").textContent = String(days).padStart(2, "0");
    document.getElementById("hours").textContent = String(hours).padStart(2, "0");
    document.getElementById("minutes").textContent = String(minutes).padStart(2, "0");
    document.getElementById("seconds").textContent = String(seconds).padStart(2, "0");
  }

  update();
  setInterval(update, 1000);
}

/* Sorry letter reveal */
function initSorryReveal() {
  const btn = document.getElementById("reveal-btn");
  const letter = document.getElementById("letter");
  const forgiveActions = document.getElementById("forgive-actions");
  if (!btn || !letter) return;

  btn.addEventListener("click", () => {
    letter.classList.add("revealed");
    btn.textContent = "I mean every word ♥";
    btn.disabled = true;
    setTimeout(() => forgiveActions?.classList.add("visible"), 800);
  });

  document.getElementById("btn-yes")?.addEventListener("click", () => {
    showForgiveResponse(
      "You just made me the happiest person alive. I promise to love you better, every single day. ♥"
    );
  });
}

/* "I need time" — impossible to click, flees from pointer */
function initRunawayButton() {
  const btn = document.getElementById("btn-later");
  const arena = document.getElementById("forgive-actions");
  if (!btn || !arena) return;

  let active = false;
  let lastFlee = 0;
  const DETECT_RADIUS = 130;
  const FLEE_COOLDOWN = 800;
  const PAD = 10;

  function arenaSize() {
    return {
      w: arena.clientWidth,
      h: arena.clientHeight,
      bw: btn.offsetWidth,
      bh: btn.offsetHeight,
    };
  }

  /* Glide to the spot farthest from the pointer */
  function fleeFrom(clientX, clientY, force = false) {
    if (!active || btn.disabled) return;

    const now = Date.now();
    if (!force && now - lastFlee < FLEE_COOLDOWN) return;
    lastFlee = now;

    const arenaRect = arena.getBoundingClientRect();
    const { w, h, bw, bh } = arenaSize();
    const maxX = Math.max(PAD, w - bw - PAD);
    const maxY = Math.max(PAD, h - bh - PAD);

    const relX = clientX - arenaRect.left;
    const relY = clientY - arenaRect.top;

    const candidates = [
      { x: PAD, y: PAD },
      { x: maxX, y: PAD },
      { x: PAD, y: maxY },
      { x: maxX, y: maxY },
      { x: maxX / 2, y: PAD },
      { x: maxX / 2, y: maxY },
      { x: PAD, y: maxY / 2 },
      { x: maxX, y: maxY / 2 },
    ];

    let best = candidates[0];
    let bestDist = -1;

    for (const c of candidates) {
      const cx = c.x + bw / 2;
      const cy = c.y + bh / 2;
      const d = Math.hypot(cx - relX, cy - relY);
      if (d > bestDist) {
        bestDist = d;
        best = c;
      }
    }

    btn.style.left = `${best.x}px`;
    btn.style.top = `${best.y}px`;
  }

  function placeInitial() {
    const { w, h, bw, bh } = arenaSize();
    btn.style.left = `${Math.max(PAD, w - bw - PAD)}px`;
    btn.style.top = `${Math.max(PAD, h / 2 - bh / 2)}px`;
  }

  function onPointerNear(clientX, clientY) {
    if (!active || btn.disabled) return;

    const bRect = btn.getBoundingClientRect();
    const cx = bRect.left + bRect.width / 2;
    const cy = bRect.top + bRect.height / 2;
    const dist = Math.hypot(clientX - cx, clientY - cy);

    if (dist < DETECT_RADIUS) fleeFrom(clientX, clientY);
  }

  function onMouseMove(e) {
    onPointerNear(e.clientX, e.clientY);
  }

  function onTouchMove(e) {
    const t = e.touches[0];
    if (t) onPointerNear(t.clientX, t.clientY);
  }

  /* Block every way to activate the button */
  function blockEvent(e) {
    if (!active || btn.disabled) return;
    e.preventDefault();
    e.stopImmediatePropagation();

    const x = e.clientX ?? e.touches?.[0]?.clientX ?? window.innerWidth / 2;
    const y = e.clientY ?? e.touches?.[0]?.clientY ?? window.innerHeight / 2;
    fleeFrom(x, y, true);
  }

  ["mousedown", "mouseup", "click", "pointerdown", "pointerup", "touchstart", "touchend"].forEach((evt) => {
    btn.addEventListener(evt, blockEvent, { capture: true, passive: false });
  });

  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("touchmove", onTouchMove, { passive: true });

  /* Activate once the letter buttons appear */
  const observer = new MutationObserver(() => {
    if (arena.classList.contains("visible") && !active) {
      active = true;
      placeInitial();
    }
  });
  observer.observe(arena, { attributes: true, attributeFilter: ["class"] });

  window.addEventListener("resize", () => {
    if (active) placeInitial();
  });
}

function showForgiveResponse(message) {
  const resp = document.getElementById("forgive-response");
  resp.classList.add("show");
  resp.querySelector("p").textContent = message;
  document.getElementById("btn-yes").disabled = true;
  document.getElementById("btn-later").disabled = true;
}

/* Scroll fade-in */
function initFadeIn() {
  const els = document.querySelectorAll(".fade-in");
  const observer = new IntersectionObserver(
    (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("visible"); }),
    { threshold: 0.12 }
  );
  els.forEach((el) => observer.observe(el));
}

/* Typing effect on home page */
function initTyping() {
  const el = document.getElementById("typing-text");
  if (!el) return;

  const phrases = [
    "I'm so sorry.",
    "You mean everything to me.",
    "Please let me show you how much I love you.",
  ];
  let phraseIndex = 0;
  let charIndex = 0;
  let deleting = false;

  function type() {
    const current = phrases[phraseIndex];
    el.textContent = deleting
      ? current.substring(0, charIndex--)
      : current.substring(0, charIndex++);

    if (!deleting && charIndex === current.length + 1) {
      deleting = true;
      setTimeout(type, 2200);
      return;
    }
    if (deleting && charIndex === 0) {
      deleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
    }

    setTimeout(type, deleting ? 40 : 70);
  }

  type();
}
