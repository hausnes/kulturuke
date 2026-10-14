const rot = document.documentElement;
const ark = document.querySelector(".ark");
const strofer = [...document.querySelectorAll(".strofe")];
const knappar = [...document.querySelectorAll("[data-vel]")];
const vegen = document.querySelector(".vegen");
const vegStiar = [...vegen.querySelectorAll(".veg-kant, .veg-sti")];
const granar = vegen.querySelector(".granar");
const hus = document.querySelector(".hus");
const kyrkje = document.querySelector(".kyrkje");

const LAGRINGSNØKKEL = "sverre-visning";
const roleg = matchMedia("(prefers-reduced-motion: reduce)").matches;

let skandaleTimer;
let veglengd = 0;

/* ---------- Strofene kjem fram ved scrolling ---------- */

const observatør = new IntersectionObserver(
  (oppføringar) => {
    for (const { target, isIntersecting } of oppføringar) {
      if (!isIntersecting) continue;
      target.classList.add("synleg");
      observatør.unobserve(target);

      if (target === strofer.at(-1)) {
        skandaleTimer = setTimeout(() => rot.classList.add("skandale"), roleg ? 0 : 1400);
      }
    }
  },
  { threshold: 0.4 }
);

function startStrofer() {
  clearTimeout(skandaleTimer);
  rot.classList.remove("skandale");
  observatør.disconnect();

  for (const strofe of strofer) {
    strofe.classList.remove("synleg");
    observatør.observe(strofe);
  }
}

/* ---------- Byte av visning ---------- */

function velVisning(visning) {
  rot.dataset.visning = visning;
  for (const knapp of knappar) {
    knapp.setAttribute("aria-pressed", String(knapp.dataset.vel === visning));
  }
  try {
    localStorage.setItem(LAGRINGSNØKKEL, visning);
  } catch {}

  scrollTo(0, 0);
  startStrofer();
  teiknVeg();
}

for (const knapp of knappar) {
  knapp.addEventListener("click", () => velVisning(knapp.dataset.vel));
}

/* ---------- Vegen ned bygda ---------- */

// Midtpunktet til eit element, relativt til arket
function midt(element) {
  const a = ark.getBoundingClientRect();
  const e = element.getBoundingClientRect();
  return { x: e.left - a.left + e.width / 2, y: e.top - a.top + e.height / 2 };
}

function teiknVeg() {
  if (rot.dataset.visning !== "veg") return;

  const breidd = ark.clientWidth;
  const smal = breidd < 640;
  const venstre = breidd * (smal ? 0.08 : 0.18);
  const høgre = breidd * (smal ? 0.92 : 0.82);

  // Vegen startar ved huset, svingar forbi kvar strofe og endar ved kyrkja
  const start = midt(hus);
  const punkt = [{ x: start.x, y: start.y + 30 }];
  strofer.forEach((strofe, i) => {
    punkt.push({ x: i % 2 === 0 ? venstre : høgre, y: midt(strofe).y });
  });
  const slutt = midt(kyrkje);
  punkt.push({ x: slutt.x, y: slutt.y + 40 });

  let d = `M ${punkt[0].x} ${punkt[0].y}`;
  for (let i = 1; i < punkt.length; i++) {
    const frå = punkt[i - 1];
    const til = punkt[i];
    const midtY = (frå.y + til.y) / 2;
    d += ` C ${frå.x} ${midtY}, ${til.x} ${midtY}, ${til.x} ${til.y}`;
  }

  for (const sti of vegStiar) sti.setAttribute("d", d);
  veglengd = vegStiar[0].getTotalLength();
  for (const sti of vegStiar) sti.style.strokeDasharray = veglengd;

  plantGranar(punkt, breidd);
  oppdaterVeg();
}

function plantGranar(punkt, breidd) {
  let svg = "";
  punkt.slice(1, -1).forEach(({ x, y }, i) => {
    const side = x < breidd / 2 ? 1 : -1;
    const storleik = 34 + (i % 3) * 10;
    svg += `<use href="#gran" x="${x + side * 46}" y="${y - 90}" width="${storleik}" height="${storleik * 1.5}"/>`;
    svg += `<use href="#gran" x="${x - side * 70 - storleik / 2}" y="${y + 50}" width="${storleik * 0.8}" height="${storleik * 1.2}"/>`;
  });
  granar.innerHTML = svg;
}

// Vegen teiknar seg fram etter kvart som ein scrollar nedover
function oppdaterVeg() {
  if (rot.dataset.visning !== "veg" || !veglengd) return;

  const topp = ark.getBoundingClientRect().top;
  const framdrift = roleg ? 1 : Math.min(1, Math.max(0, (innerHeight * 0.75 - topp) / ark.offsetHeight));

  for (const sti of vegStiar) sti.style.strokeDashoffset = veglengd * (1 - framdrift);
}

addEventListener("scroll", () => requestAnimationFrame(oppdaterVeg), { passive: true });
new ResizeObserver(teiknVeg).observe(ark);
document.fonts.ready.then(teiknVeg);

/* ---------- Start ---------- */

velVisning(rot.dataset.visning);
