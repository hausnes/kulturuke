const rot = document.documentElement;
const knappar = [...document.querySelectorAll("[data-vel]")];
const scene = document.querySelector(".scene");
const handtak = document.querySelector(".handtak");

const LAGRINGSNØKKEL = "liten-visning";
const loddrett = matchMedia("(max-width: 640px)");

/* ---------- Byte av visning ---------- */

function velVisning(visning) {
  rot.dataset.visning = visning;
  for (const knapp of knappar) {
    knapp.setAttribute("aria-pressed", String(knapp.dataset.vel === visning));
  }
  try {
    localStorage.setItem(LAGRINGSNØKKEL, visning);
  } catch {}

  scene.classList.remove("brukt");
  settPosisjon(100);
}

for (const knapp of knappar) {
  knapp.addEventListener("click", () => velVisning(knapp.dataset.vel));
}

/* ---------- Før og etter-glidaren ---------- */

function settPosisjon(prosent) {
  const pos = Math.min(100, Math.max(0, prosent));
  scene.style.setProperty("--pos", `${pos}%`);
  handtak.setAttribute("aria-valuenow", String(Math.round(pos)));
}

// Kor langt inn i scena peikaren er, i prosent – vassrett eller loddrett etter skjermbreidda
function posisjonFrå(hending) {
  const boks = scene.getBoundingClientRect();
  return loddrett.matches
    ? ((hending.clientY - boks.top) / boks.height) * 100
    : ((hending.clientX - boks.left) / boks.width) * 100;
}

let drar = false;

handtak.addEventListener("pointerdown", (hending) => {
  hending.preventDefault();
  handtak.setPointerCapture(hending.pointerId);
  drar = true;
  scene.classList.add("brukt");
});

handtak.addEventListener("pointermove", (hending) => {
  if (drar) settPosisjon(posisjonFrå(hending));
});

for (const type of ["pointerup", "pointercancel"]) {
  handtak.addEventListener(type, () => (drar = false));
}

// Klikk eller trykk i scena flyttar glidaren dit
scene.addEventListener("click", (hending) => {
  if (rot.dataset.visning !== "glidar" || hending.target.closest(".handtak")) return;
  scene.classList.add("brukt");
  settPosisjon(posisjonFrå(hending));
});

handtak.addEventListener("keydown", (hending) => {
  const no = Number(handtak.getAttribute("aria-valuenow"));
  const steg = { ArrowLeft: -5, ArrowUp: -5, ArrowRight: 5, ArrowDown: 5 }[hending.key];

  if (steg) settPosisjon(no + steg);
  else if (hending.key === "Home") settPosisjon(0);
  else if (hending.key === "End") settPosisjon(100);
  else return;

  hending.preventDefault();
  scene.classList.add("brukt");
});

/* ---------- Start ---------- */

velVisning(rot.dataset.visning);
