# Det lyriske hjørna

Ein samling favorittdikt, publisert med GitHub Pages. Kvart dikt har si eiga side og sin eigen CSS.

## Struktur

```
index.html, style.css, script.js   Startsida
dikt.json                          Oversikt over alle dikta (startsida les denne)
dikt/<mappe>/                      Eitt dikt per mappe: index.html, style.css og ev. bilete/lyd
les/                               Alle dikta som rein tekst (hentar teksten frå diktsidene)
```

## Leggje til eit dikt

1. Kopier `dikt/eksempel/` til ei ny mappe, t.d. `dikt/mitt-dikt/`.
2. Skriv inn diktet i `index.html` og eksperimenter i `style.css`.
3. Byt ut `#eksempel` i «Rein tekst»-lenkja med namnet på mappa.
4. Legg til ei oppføring i `dikt.json`:

```json
{
  "tittel": "Mitt dikt",
  "forfatter": "Namn Namnesen",
  "kategorier": ["humor"],
  "mappe": "mitt-dikt"
}
```

Nye kategoriar dukkar opp i filteret automatisk. Vil du gi ein kategori eigen farge, legg du han til i `style.css`.

### Merk teksten for rein tekst-visninga

`les/` hentar teksten rett frå diktsida, så diktet berre finst éin stad. Då må diktsida merkje kva som er tekst:

- `data-strofe` på kvart element som inneheld ei strofe.
- Inne i ei strofe sluttar ei linje ved `<br>`, eller ved slutten av eit element med `data-linje`.
- `<svg>`, `<button>` og alt med `aria-hidden="true"` blir hoppa over, så pynt kan liggje inne i strofa.
- `<em>` blir verande kursiv.

```html
<p data-strofe>
  Første linje,<br>
  andre linje.
</p>
```

## Køyre lokalt

Startsida hentar `dikt.json` med `fetch`, så ho må køyrast via ein vevtenar (ikkje ved å opne fila direkte):

```
python -m http.server
```

Opne så http://localhost:8000. Live Server i VS Code fungerer òg.
