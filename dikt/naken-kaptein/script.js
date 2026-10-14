const rot = document.documentElement;
const strofer = [...document.querySelectorAll(".strofe")];
const svg = document.querySelector(".scene svg");

rot.classList.add("js");

// Strofa som passerer eit band i nedre del av skjermen (under scena) styrer scena
const vaktar = new IntersectionObserver(
  (oppføringar) => {
    for (const { target, isIntersecting } of oppføringar) {
      if (!isIntersecting) continue;
      rot.dataset.scene = target.dataset.scene;
      for (const strofe of strofer) strofe.classList.toggle("aktiv", strofe === target);
    }
  },
  { rootMargin: "-62% 0px -22% 0px" }
);

for (const strofe of strofer) vaktar.observe(strofe);

// Scena skal alltid vise heile høgda. På breie skjermar held havet og himmelen fram til sidene.
function tilpassScene() {
  const { width, height } = svg.getBoundingClientRect();
  svg.setAttribute("preserveAspectRatio", width / height > 2 ? "xMidYMax meet" : "xMidYMax slice");
}

new ResizeObserver(tilpassScene).observe(svg);
