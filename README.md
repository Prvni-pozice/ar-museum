# AR Muzeum — archeologie Vysočiny

AR prohlížeč muzejních exponátů ve stylu `3d-web` (KTM AR Inspector): statická
stránka na Google `<model-viewer>`, bez buildu a bez závislostí. Na mobilu
postaví předmět do prostoru přes WebXR / Scene Viewer / Quick Look.

## Stav — modely zatím chybí

Muzeum Vysočiny Jihlava má v rámci NPO 3 digitalizovaných **60 archeologických
předmětů ve 3D**. Jejich záznamy jsou veřejné v krajském Krameriu, ale samotné
digitalizáty ne:

| Co | Stav |
|---|---|
| Metadata 60 předmětů | ✅ veřejné → `data/exhibits.json` |
| Náhledové fotky | ✅ veřejné → `data/thumbs/` |
| 3D digitalizát (`IMG_FULL`) | ❌ HTTP 403, licence `kkvhb_sbirka_mvji_jie301` |

Předměty jsou označené `accessibility: public`, ale plný datastream je za
licencí — anonymně vrací `403 user 'not_logged' is not allowed to read
datastream 'IMG_FULL'`. Získat je znamená domluvit se s Muzeem Vysočiny Jihlava.

Dokud model v `models/` není, stránka u exponátu ukáže veřejný náhled a důvod.
Jakmile tam soubor bude, načte se sám — nic se nepřepisuje.

**Formát:** digitalizáty jsou **3D PDF** (U3D/PRC), ne glTF. Pro `<model-viewer>`
je bude potřeba převést na `.glb` — počítej s tím jako se samostatným krokem.

## Struktura

```
index.html                  prohlížeč, 3 exponáty v konstantě EXHIBITS
data/exhibits.json          všech 60 předmětů (pid, název, inv. č., klíčová slova)
data/thumbs/<slug>.jpg      veřejné náhledy
models/<slug>.glb           sem patří modely (gitignored)
scripts/fetch-kramerius.mjs stahovač metadat, náhledů a (s přístupem) modelů
```

Vybrané tři exponáty: **Sekeromlat** (neolit), **Koníček – hračka** (středověk),
**Dlaždice – Samson a lev** (středověk). Výměna = úprava pole `EXHIBITS`
v `index.html`, slugy vezmi z `data/exhibits.json`.

## Spuštění

```bash
python3 -m http.server 5199    # http://<server>:5199
```

AR funguje jen přes HTTPS na skutečném telefonu — na localhostu se tlačítko
chová jako neaktivní.

## Stažení dat

```bash
node scripts/fetch-kramerius.mjs                    # metadata + náhledy
KRAMERIUS_COOKIE="JSESSIONID=…" node scripts/fetch-kramerius.mjs   # včetně modelů
```

Zdroj: [Kramerius Kraje Vysočina](https://kramerius.kkvysociny.cz/), sbírka
[Muzeum Vysočiny Jihlava](https://mvji.cz/stranky/digitalizace-sbirkoveho-fondu-muzea-vysociny-jihlava-1-cast).
Obsah je muzejní — před publikováním na web si ověř podmínky užití.
