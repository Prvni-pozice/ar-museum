# AR Muzeum

AR prohlížeč historických exponátů ve stylu `3d-web` (KTM AR Inspector): statická
stránka na Google `<model-viewer>`, bez buildu a bez frameworku. Návštěvník
naskenuje QR kód u vitríny, otevře se mu rovnou ten jeden předmět a může si ho
postavit před sebe v AR ve skutečné velikosti.

## Exponáty

| Předmět | Datace | Délka | Model |
|---|---|---|---|
| Estoc — bodný meč | 14.–16. stol., Evropa | 149 cm | 2,5 MB |
| Katana | od 14. stol., Japonsko | 100 cm | 0,6 MB |
| Dělo — předovka | 17.–18. stol. | 230 cm | 3,6 MB |

Modely jsou **CC0 skeny z [Poly Haven](https://polyhaven.com/)** — volně použitelné
i komerčně, bez uvádění autora. Nejsou to katalogizované muzejní kusy: datace
v popiscích popisuje **typ předmětu**, ne konkrétní exemplář.

Popisky žijí v `data/exhibits-ar.json`, takže se dají měnit bez sahání do stránky.

## QR deep-linking

Každý exponát má vlastní URL `?e=<key>` (`estoc`, `katana`, `delo`). QR kód na ni
míří přímo — naskenování otevře ten předmět, ne rozcestník.

```bash
BASE_URL=https://ar.example.cz npm run qr
```

Vygeneruje `qr/<key>.svg` a tiskový list `qr.html` (karta s kódem, názvem, datací
a kontrolní URL pod ním). Po nasazení na jinou doménu pusť znovu s jiným `BASE_URL`.

## Spuštění

```bash
npm install
npm run models     # stáhne modely z Poly Haven a zabalí je do .glb
npm run qr         # QR kódy + tiskový list
npm run dev        # http://<server>:5199
```

`models/` je gitignorované — binárky do repa nepatří, skript je stáhne
reprodukovatelně.

## Nasazení (Vercel)

`vercel.json` pouští `npm run models && npm run qr` jako build a servíruje
kořen repa. QR kódy se generují proti produkční doméně projektu automaticky;
na vlastní doméně nastav env `BASE_URL` a přegeneruj.

Repo: `Prvni-pozice/ar-museum`, SSH alias `github-ar-museum`
(deploy key `~/.ssh/id_ar_museum` na VPS). Push do `master` = deploy.

AR funguje jen přes **HTTPS na skutečném telefonu** (WebXR / Scene Viewer /
Quick Look). Na localhostu si model prohlédneš, ale tlačítko AR nenaskočí.

## Struktura

```
index.html                    prohlížeč + deep-link ?e=<key>
data/exhibits-ar.json         popisky exponátů
models/<id>.glb               modely                          [gitignored]
qr/<key>.svg, qr.html         QR kódy a tiskový list          [gitignored]
scripts/fetch-models.mjs      stahovač z Poly Haven + balení do glb
scripts/make-qr.mjs           generátor QR
```

## Odložená větev: sbírka Muzea Vysočiny Jihlava

Původní záměr byl vzít 3D skeny z Kraje Vysočina. Muzeum Vysočiny Jihlava má
v rámci NPO 3 digitalizovaných **60 archeologických předmětů**, jejich záznamy
i náhledy jsou veřejné, ale samotné digitalizáty ne:

- `data/exhibits.json` — metadata všech 60 kusů (pid, název, inv. č., období)
- `scripts/fetch-kramerius.mjs` — stáhne metadata, náhledy a s přihlášením i modely

Datastream `IMG_FULL` je pod licencí `kkvhb_sbirka_mvji_jie301` a anonymně vrací
`403`. API to potvrzuje: nepřihlášený uživatel má jen licenci `public`. Se session
cookie v `KRAMERIUS_COOKIE` skript projde. Pozor: digitalizáty jsou **3D PDF**
(U3D/PRC), pro `<model-viewer>` je bude potřeba převést na `.glb`.
