const rot = document.documentElement;
const strofer = [...document.querySelectorAll(".strofe")];
const krus = document.querySelector(".krus");
const krusTal = document.querySelector(".krus-tal");

rot.classList.add("js");

// Éin verdi per strofe (19 i alt, med moralen til slutt)
//               1  2  3  4  5  6    7    8    9    10   11   12   13   14  15  16   17   18   moral
const RUS =     [0, 0, 0, 0, 0, .05, .15, .25, .45, .6,  .8,  .85, .9,  1,  1,  .6,  .2,  .1,  0];
const FYLLE =   [0, 0, 0, 0, 0, 0,   0,   0,   0,   0,   0,   0,   0,   0,  0,  .6,  1,   .8,  0];
const KRUS =    [0, 0, 0, 2, 4, 5,   5,   6,   7,   7,   7,   7,   7,   7,  7,  7,   7,   7,   7];

// Dei store augneblinka: klasse på <html> og kva strofer (1-basert) han gjeld for
const AUGNEBLINK = {
  dans: [11, 12, 13, 14],
  gele: [14],
  kraup: [15],
  dunk: [17],
  velt: [16, 17, 18, 19],
};

let talKrus = 0;

function skjenk(tal) {
  if (tal === talKrus) return;
  talKrus = tal;
  krusTal.textContent = tal ? `Krus nr. ${tal}` : "Ingen krus enno";

  // Start skjenke-animasjonen på nytt
  krus.classList.remove("skjenk");
  void krus.offsetWidth;
  if (tal) krus.classList.add("skjenk");
}

function settSteg(indeks) {
  const steg = indeks + 1;
  rot.style.setProperty("--rus", RUS[indeks]);
  rot.style.setProperty("--fylle", FYLLE[indeks]);

  for (const [klasse, stega] of Object.entries(AUGNEBLINK)) {
    rot.classList.toggle(klasse, stega.includes(steg));
  }

  for (const strofe of strofer) strofe.classList.toggle("aktiv", strofe === strofer[indeks]);
  skjenk(KRUS[indeks]);
}

// Strofa som passerer midten av skjermen styrer rusen
const vaktar = new IntersectionObserver(
  (oppføringar) => {
    for (const { target, isIntersecting } of oppføringar) {
      if (isIntersecting) settSteg(strofer.indexOf(target));
    }
  },
  { rootMargin: "-45% 0px -45% 0px" }
);

for (const strofe of strofer) vaktar.observe(strofe);
