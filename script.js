const liste = document.getElementById("diktliste");
const kategoriChips = document.getElementById("kategorier");
const forfatterValg = document.getElementById("forfatter");
const antallTekst = document.getElementById("antall");

const sorter = (a, b) => a.localeCompare(b, "nb");

let alleDikt = [];
let valgtKategori = "";
let valgtForfatter = "";

async function start() {
  try {
    const svar = await fetch("dikt.json");
    if (!svar.ok) throw new Error(svar.status);
    alleDikt = await svar.json();
  } catch (feil) {
    console.error("Klarte ikkje å laste dikt.json:", feil);
    liste.innerHTML = '<li class="tom">Fann ingen dikt å vise akkurat no.</li>';
    return;
  }

  alleDikt.sort((a, b) => sorter(a.tittel, b.tittel));
  lesFraUrl();
  lagKategoriChips();
  lagForfatterValg();
  visDikt();
}

function lesFraUrl() {
  const params = new URLSearchParams(location.search);
  valgtKategori = params.get("kategori") ?? "";
  valgtForfatter = params.get("forfatter") ?? "";
}

function skrivTilUrl() {
  const params = new URLSearchParams();
  if (valgtKategori) params.set("kategori", valgtKategori);
  if (valgtForfatter) params.set("forfatter", valgtForfatter);
  const query = params.toString();
  history.replaceState(null, "", query ? `?${query}` : location.pathname);
}

function lagKategoriChips() {
  const kategorier = [...new Set(alleDikt.flatMap((d) => d.kategorier))].sort(sorter);

  for (const kategori of ["", ...kategorier]) {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "chip";
    chip.textContent = kategori || "Alle";
    if (kategori) chip.dataset.kategori = kategori;
    chip.setAttribute("aria-pressed", String(kategori === valgtKategori));

    chip.addEventListener("click", () => {
      valgtKategori = kategori;
      for (const c of kategoriChips.children) {
        c.setAttribute("aria-pressed", String(c === chip));
      }
      oppdater();
    });

    kategoriChips.append(chip);
  }
}

function lagForfatterValg() {
  const forfattere = [...new Set(alleDikt.map((d) => d.forfatter))].sort(sorter);

  for (const forfatter of forfattere) {
    forfatterValg.append(new Option(forfatter, forfatter));
  }
  forfatterValg.value = forfattere.includes(valgtForfatter) ? valgtForfatter : "";

  forfatterValg.addEventListener("change", () => {
    valgtForfatter = forfatterValg.value;
    oppdater();
  });
}

function oppdater() {
  skrivTilUrl();
  visDikt();
}

function visDikt() {
  const treff = alleDikt.filter(
    (d) =>
      (!valgtKategori || d.kategorier.includes(valgtKategori)) &&
      (!valgtForfatter || d.forfatter === valgtForfatter)
  );

  liste.replaceChildren(...treff.map(lagKort));

  if (treff.length === 0) {
    liste.innerHTML = '<li class="tom">Ingen dikt passar filteret.</li>';
  }

  antallTekst.textContent =
    treff.length === alleDikt.length
      ? `${alleDikt.length} dikt`
      : `Viser ${treff.length} av ${alleDikt.length} dikt`;
}

function lagKort(dikt) {
  const li = document.createElement("li");
  li.className = "dikt";

  const lenke = document.createElement("a");
  lenke.href = `dikt/${dikt.mappe}/`;

  const tittel = document.createElement("h2");
  tittel.className = "dikt-tittel";
  tittel.textContent = dikt.tittel;

  const forfatter = document.createElement("p");
  forfatter.className = "dikt-forfatter";
  forfatter.textContent = dikt.forfatter;

  const tagger = document.createElement("div");
  tagger.className = "tagger";
  for (const kategori of dikt.kategorier) {
    const tag = document.createElement("span");
    tag.className = "tag";
    tag.dataset.kategori = kategori;
    tag.textContent = kategori;
    tagger.append(tag);
  }

  lenke.append(tittel, forfatter, tagger);
  li.append(lenke);
  return li;
}

start();
