const canvas = document.querySelector("#starfield");
const ctx = canvas.getContext("2d");
const cursorGlow = document.querySelector(".cursor-glow");
const typingTarget = document.querySelector(".typing-text");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let width = 0;
let height = 0;
let stars = [];
let pointer = { x: 0.5, y: 0.3 };

function resizeCanvas() {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = Math.floor(width * ratio);
  canvas.height = Math.floor(height * ratio);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

  const starCount = Math.floor(Math.min(210, Math.max(90, width * height / 8000)));
  stars = Array.from({ length: starCount }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    z: Math.random() * 1.4 + 0.25,
    speed: Math.random() * 0.45 + 0.12,
    size: Math.random() * 1.8 + 0.45,
    hue: Math.random() > 0.5 ? "84, 255, 159" : "179, 92, 255"
  }));
}

function drawStars() {
  ctx.clearRect(0, 0, width, height);

  for (const star of stars) {
    const driftX = (pointer.x - 0.5) * star.z * 22;
    const driftY = (pointer.y - 0.5) * star.z * 18;
    star.y += star.speed * star.z;
    star.x += Math.sin((star.y + star.z) * 0.012) * 0.12;

    if (star.y > height + 12) {
      star.y = -12;
      star.x = Math.random() * width;
    }

    ctx.beginPath();
    ctx.fillStyle = `rgba(${star.hue}, ${0.34 + star.z * 0.24})`;
    ctx.shadowBlur = 12 * star.z;
    ctx.shadowColor = `rgba(${star.hue}, 0.8)`;
    ctx.arc(star.x + driftX, star.y + driftY, star.size * star.z, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.shadowBlur = 0;

  if (!reducedMotion) {
    requestAnimationFrame(drawStars);
  }
}

function runTypingEffect() {
  if (!typingTarget) return;

  const phrases = JSON.parse(typingTarget.dataset.phrases || "[]");
  let phraseIndex = 0;
  let charIndex = 0;
  let removing = false;

  function tick() {
    const phrase = phrases[phraseIndex] || "";
    typingTarget.textContent = phrase.slice(0, charIndex);

    if (!removing && charIndex < phrase.length) {
      charIndex += 1;
      setTimeout(tick, 58);
      return;
    }

    if (!removing && charIndex === phrase.length) {
      removing = true;
      setTimeout(tick, 1500);
      return;
    }

    if (removing && charIndex > 0) {
      charIndex -= 1;
      setTimeout(tick, 28);
      return;
    }

    removing = false;
    phraseIndex = (phraseIndex + 1) % phrases.length;
    setTimeout(tick, 260);
  }

  tick();
}

function attachPointerEffects() {
  window.addEventListener("pointermove", (event) => {
    pointer = {
      x: event.clientX / Math.max(width, 1),
      y: event.clientY / Math.max(height, 1)
    };

    cursorGlow.style.setProperty("--x", `${event.clientX}px`);
    cursorGlow.style.setProperty("--y", `${event.clientY}px`);
  });

  document.querySelectorAll(".tilt-card").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(900px) rotateX(${-y * 7}deg) rotateY(${x * 9}deg) translateY(-2px)`;
    });

    card.addEventListener("pointerleave", () => {
      card.style.transform = "";
    });
  });
}

function spawnShootingStar() {
  if (reducedMotion) return;

  const star = document.createElement("span");
  star.style.position = "fixed";
  star.style.top = `${Math.random() * 55}vh`;
  star.style.left = `${Math.random() * 85}vw`;
  star.style.width = "92px";
  star.style.height = "2px";
  star.style.pointerEvents = "none";
  star.style.zIndex = "2";
  star.style.transform = "rotate(-26deg)";
  star.style.background = "linear-gradient(90deg, transparent, rgba(84,255,159,.95), transparent)";
  star.style.boxShadow = "0 0 16px rgba(84,255,159,.65)";
  star.style.animation = "shoot 900ms ease-out forwards";
  document.body.appendChild(star);
  setTimeout(() => star.remove(), 950);
}

function attachClickBursts() {
  const codeSnippets = ["const zuzu = true;", "build();", "Zudoku.run()", "while(alive){code();}", "0xZUZU", "deploy_ready"];
  const interactiveSelector = "a, button";

  window.addEventListener("pointerdown", (event) => {
    if (event.target.closest(interactiveSelector)) return;

    const code = document.createElement("span");
    code.className = "code-pop";
    code.textContent = codeSnippets[Math.floor(Math.random() * codeSnippets.length)];
    code.style.left = `${event.clientX}px`;
    code.style.top = `${event.clientY}px`;
    document.body.appendChild(code);
    setTimeout(() => code.remove(), 920);

    for (let i = 0; i < 12; i += 1) {
      const particle = document.createElement("span");
      const angle = (Math.PI * 2 * i) / 12 + Math.random() * 0.35;
      const distance = 34 + Math.random() * 48;
      particle.className = "click-burst";
      particle.style.left = `${event.clientX}px`;
      particle.style.top = `${event.clientY}px`;
      particle.style.setProperty("--dx", `${Math.cos(angle) * distance}px`);
      particle.style.setProperty("--dy", `${Math.sin(angle) * distance}px`);
      particle.style.background = i % 2 === 0 ? "var(--neon)" : "var(--neon-2)";
      document.body.appendChild(particle);
      setTimeout(() => particle.remove(), 780);
    }
  });
}

const style = document.createElement("style");
style.textContent = `
@keyframes shoot {
  from { opacity: 0; translate: 0 0; }
  15% { opacity: 1; }
  to { opacity: 0; translate: -180px 110px; }
}`;
document.head.appendChild(style);

window.addEventListener("resize", resizeCanvas);
resizeCanvas();
drawStars();
runTypingEffect();
attachPointerEffects();
attachClickBursts();
setInterval(spawnShootingStar, 2400);
