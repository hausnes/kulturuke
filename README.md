# Det lyriske hjørna

Ein samling favorittdikt, publisert med GitHub Pages. Kvart dikt har si eiga side og sin eigen CSS.

## Struktur

```
index.html, style.css, script.js   Startsida
dikt.json                          Oversikt over alle dikta (startsida les denne)
dikt/<mappe>/                      Eitt dikt per mappe: index.html, style.css og ev. bilete/lyd
```

## Leggje til eit dikt

1. Kopier `dikt/eksempel/` til ei ny mappe, t.d. `dikt/mitt-dikt/`.
2. Skriv inn diktet i `index.html` og eksperimenter i `style.css`.
3. Legg til ei oppføring i `dikt.json`:

```json
{
  "tittel": "Mitt dikt",
  "forfatter": "Namn Namnesen",
  "kategorier": ["humor"],
  "mappe": "mitt-dikt"
}
```

Nye kategoriar dukkar opp i filteret automatisk. Vil du gi ein kategori eigen farge, legg du han til i `style.css`.

## Køyre lokalt

Startsida hentar `dikt.json` med `fetch`, så ho må køyrast via ein vevtenar (ikkje ved å opne fila direkte):

```
python -m http.server
```

Opne så http://localhost:8000. Live Server i VS Code fungerer òg.
