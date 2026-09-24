// Stáhne CC0 modely z Poly Haven (gltf + textury) a zabalí je do jednoho .glb,
// protože AR prohlížeče (Scene Viewer, Quick Look) chtějí jeden soubor.
// Rozlišení 1k — modely jedou na mobilu přes data, ne po Wi-Fi.
import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'

const RES = '1k'
const IDS = ['antique_estoc', 'antique_katana_01', 'cannon_01']
const TMP = 'tmp-models'

fs.mkdirSync('models', { recursive: true })

for (const id of IDS) {
  const files = (await (await fetch(`https://api.polyhaven.com/files/${id}`)).json()).gltf[RES].gltf
  const dir = path.join(TMP, id)
  fs.mkdirSync(dir, { recursive: true })

  const main = path.basename(new URL(files.url).pathname)
  const all = [[main, files.url], ...Object.entries(files.include).map(([p, f]) => [p, f.url])]
  let bytes = 0
  for (const [rel, url] of all) {
    const dest = path.join(dir, rel)
    fs.mkdirSync(path.dirname(dest), { recursive: true })
    const buf = Buffer.from(await (await fetch(url)).arrayBuffer())
    fs.writeFileSync(dest, buf)
    bytes += buf.length
  }

  const out = path.join('models', `${id}.glb`)
  execFileSync('npx', ['gltf-pipeline', '-i', path.join(dir, main), '-o', out], { stdio: 'pipe' })
  const glb = fs.statSync(out).size
  console.log(`${id.padEnd(20)} ${(bytes / 1e6).toFixed(1)} MB zdroj → ${(glb / 1e6).toFixed(1)} MB glb`)
}

fs.rmSync(TMP, { recursive: true, force: true })
