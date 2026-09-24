// Stáhne z krajského Krameria seznam 3D digitalizovaných předmětů Muzea
// Vysočiny Jihlava (archeologická podsbírka, 60 kusů) + veřejné náhledy.
//
// Samotné 3D modely (datastream IMG_FULL, formát 3D PDF) jsou pod licencí
// `kkvhb_sbirka_mvji_jie301` a anonymní stažení vrací 403. Skript to zkusí
// a u každého předmětu zapíše, jak dopadl — s přihlášením (cookie v
// KRAMERIUS_COOKIE) projdou i modely.
import fs from 'node:fs'

const API = 'https://kramerius.kkvysociny.cz/search/api/client/v7.0'
const QUERY = 'model:museumExhibit AND genres.search:Archeologie AND -keywords.search:"stříbrná mince"'
const headers = process.env.KRAMERIUS_COOKIE ? { Cookie: process.env.KRAMERIUS_COOKIE } : {}

const u = new URL(`${API}/search`)
u.searchParams.set('q', QUERY)
u.searchParams.set('rows', '100')
u.searchParams.set('fl', 'pid,title.search,keywords.facet,id_other,shelf_locators,accessibility')
const docs = (await (await fetch(u, { headers })).json()).response.docs
console.log(`Předmětů v podsbírce: ${docs.length}`)

const exhibits = []
for (const d of docs) {
  const pid = d.pid
  const info = await (await fetch(`${API}/items/${pid}/info`, { headers })).json()
  const thumbRes = await fetch(`${API}/items/${pid}/image/thumb`, { headers })
  const slug = pid.replace('uuid:', '').slice(0, 8)
  if (thumbRes.ok) {
    fs.writeFileSync(`data/thumbs/${slug}.jpg`, Buffer.from(await thumbRes.arrayBuffer()))
  }
  const full = await fetch(`${API}/items/${pid}/image`, { headers })
  if (full.ok) {
    fs.writeFileSync(`models/${slug}.pdf`, Buffer.from(await full.arrayBuffer()))
  }
  exhibits.push({
    pid, slug,
    title: d['title.search'],
    keywords: d['keywords.facet'] || [],
    inventory: (d.id_other || []).find(x => x.startsWith('inventaryNumber:'))?.split(':')[1] || null,
    format: info.image?.type || null,
    thumb: thumbRes.ok ? `data/thumbs/${slug}.jpg` : null,
    model: full.ok ? `models/${slug}.pdf` : null,
    modelStatus: full.ok ? 'staženo' : `${full.status} — licence ${full.status === 403 ? 'kkvhb_sbirka_mvji_jie301' : ''}`.trim(),
  })
  process.stdout.write(full.ok ? '#' : '.')
}
console.log()

fs.writeFileSync('data/exhibits.json', JSON.stringify(exhibits, null, 1))
const ok = exhibits.filter(e => e.model).length
console.log(`Náhledy: ${exhibits.filter(e => e.thumb).length}/${exhibits.length}`)
console.log(`3D modely: ${ok}/${exhibits.length}` + (ok ? '' : ' — všechny 403, potřeba přihlášení s licencí'))
