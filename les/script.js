/* Hentar teksten direkte frå diktsidene, så kvart dikt berre finst éin stad.
   Diktsidene merkjer kvar strofe med data-strofe. Inne i ei strofe sluttar ei linje
   ved <br> eller ved slutten av eit element med data-linje. */

const innhald = document.getElementById("innhald");
const dikta = document.getElementById("dikta");

// Pynt som ikkje er ein del av teksten
const HOPP_OVER = new Set(["SVG", "SCRIPT", "STYLE", "BUTTON"]);

async function start() {
  let liste;
  try {
    const svar = await fetch("../dikt.json");
    if (!svar.ok) throw new Error(svar.status);
    liste = await svar.json();
  } catch (feil) {
    console.error("Klarte ikkje å laste dikt.json:", feil);
    dikta.innerHTML = '<p class="melding">Fann ingen dikt å vise akkurat no.</p>';
    return;
  }

  liste.sort((a, b) => a.tittel.localeCompare(b.tittel, "nn"));

  const artiklar = await Promise.all(liste.map(lagArtikkel));
  dikta.replaceChildren(...artiklar);
  innhald.replaceChildren(...liste.map(lagInnhaldspunkt));

  // Lenkja kom frå ei diktside (#mappe) – hopp dit no som teksten er på plass
  if (location.hash) {
    document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView();
  }
}

function lagInnhaldspunkt(dikt) {
  const li = document.createElement("li");
  const lenke = document.createElement("a");
  lenke.href = `#${dikt.mappe}`;
  lenke.textContent = dikt.tittel;
  li.append(lenke, ` – ${dikt.forfatter}`);
  return li;
}

async function lagArtikkel(dikt) {
  const artikkel = document.createElement("article");
  artikkel.className = "dikt";
  artikkel.id = dikt.mappe;

  const tittel = document.createElement("h2");
  tittel.textContent = dikt.tittel;

  const forfatter = document.createElement("p");
  forfatter.className = "forfatter";
  forfatter.textContent = dikt.forfatter;

  artikkel.append(tittel, forfatter);

  try {
    const svar = await fetch(`../dikt/${dikt.mappe}/`);
    if (!svar.ok) throw new Error(svar.status);
    const dok = new DOMParser().parseFromString(await svar.text(), "text/html");
    const strofer = [...dok.querySelectorAll("[data-strofe]")].map(lesLinjer).filter((l) => l.length);
    if (!strofer.length) throw new Error("fann ingen strofer");

    for (const linjer of strofer) artikkel.append(lagStrofe(linjer));
  } catch (feil) {
    console.error(`Klarte ikkje å hente «${dikt.tittel}»:`, feil);
    const melding = document.createElement("p");
    melding.className = "melding";
    melding.textContent = "Klarte ikkje å hente teksten til dette diktet.";
    artikkel.append(melding);
  }

  const stilsett = document.createElement("a");
  stilsett.className = "stilsett";
  stilsett.href = `../dikt/${dikt.mappe}/`;
  stilsett.textContent = "Sjå den stilsette versjonen →";
  artikkel.append(stilsett);

  return artikkel;
}

// Gjer ei strofe om til ei liste med linjer. Kvar linje er ei liste med bitar: { tekst, kursiv }
function lesLinjer(strofe) {
  const linjer = [];
  let linje = [];

  function avslutt() {
    const ferdig = rydd(linje);
    if (ferdig.length) linjer.push(ferdig);
    linje = [];
  }

  function gå(node, kursiv) {
    for (const barn of node.childNodes) {
      if (barn.nodeType === Node.TEXT_NODE) {
        linje.push({ tekst: barn.textContent.replace(/\s+/g, " "), kursiv });
        continue;
      }
      if (barn.nodeType !== Node.ELEMENT_NODE) continue;
      if (HOPP_OVER.has(barn.tagName.toUpperCase()) || barn.getAttribute("aria-hidden") === "true") continue;

      if (barn.tagName === "BR") {
        avslutt();
      } else if (barn.hasAttribute("data-linje")) {
        avslutt();
        gå(barn, kursiv);
        avslutt();
      } else {
        gå(barn, kursiv || barn.tagName === "EM" || barn.tagName === "I");
      }
    }
  }

  gå(strofe, false);
  avslutt();
  return linjer;
}

// Fjern mellomrom i endane og doble mellomrom mellom bitane
function rydd(bitar) {
  let tekst = "";
  const ut = [];
  for (const { tekst: t, kursiv } of bitar) {
    let del = t;
    if (!tekst || tekst.endsWith(" ")) del = del.replace(/^ /, "");
    if (!del) continue;
    tekst += del;
    ut.push({ tekst: del, kursiv });
  }
  while (ut.length) {
    const siste = ut.at(-1);
    siste.tekst = siste.tekst.replace(/ $/, "");
    if (siste.tekst) break;
    ut.pop();
  }
  return ut;
}

function lagStrofe(linjer) {
  const p = document.createElement("p");
  p.className = "strofe";
  linjer.forEach((bitar, i) => {
    if (i > 0) p.append(document.createElement("br"));
    for (const { tekst, kursiv } of bitar) {
      if (kursiv) {
        const em = document.createElement("em");
        em.textContent = tekst;
        p.append(em);
      } else {
        p.append(tekst);
      }
    }
  });
  return p;
}

start();
