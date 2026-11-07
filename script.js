const canvas = document.querySelector("#starfield");
const ctx = canvas.getContext("2d");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let width = 0;
let height = 0;
let stars = [];

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
    ctx.arc(star.x, star.y, star.size * star.z, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.shadowBlur = 0;

  if (!reducedMotion) {
    requestAnimationFrame(drawStars);
  }
}

if (/^tr(?:-|$)/i.test(navigator.language)) {
  document.documentElement.lang = "tr";
  document.title = "Zuzu | Yazılım ve Oyun Geliştiricisi";
  document.querySelector('meta[name="description"]').content =
    "Yusuf Zuzu’nun yazılım, oyun ve web projeleri.";
  document.querySelectorAll("[data-tr]").forEach((element) => {
    element.textContent = element.dataset.tr;
  });
  document.querySelectorAll("[data-tr-label]").forEach((element) => {
    element.setAttribute("aria-label", element.dataset.trLabel);
  });
}

const filters = document.querySelector(".project-filters");
const platforms = filters.querySelector(".game-filters");
const filterButtons = filters.querySelectorAll("[data-filter]");
const projectCards = document.querySelectorAll(".project-card");

filters.addEventListener("click", (event) => {
  const button = event.target.closest("[data-filter]");
  if (!button) return;

  const selected = button.dataset.filter;
  const platformSelected = platforms.contains(button);
  platforms.hidden = selected !== "games" && !platformSelected;

  filterButtons.forEach((filter) => {
    const active = filter === button || (platformSelected && filter.dataset.filter === "games");
    filter.setAttribute("aria-pressed", String(active));
  });

  projectCards.forEach((card) => {
    const categories = card.dataset.category.split(" ");
    card.hidden = selected !== "all" && !categories.includes(selected)
      && !(selected === "games" && categories.some((category) => category === "mobile" || category === "roblox"));
  });
});
filters.hidden = false;

window.addEventListener("resize", () => {
  resizeCanvas();
  if (reducedMotion) drawStars();
});
resizeCanvas();
drawStars();
