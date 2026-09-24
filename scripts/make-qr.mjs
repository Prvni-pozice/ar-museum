// Vygeneruje QR kód pro každý exponát (míří na ?e=<key>) a tiskový list qr.html,
// který se dá vytisknout a položit k vitríně.
// Základ URL se liší podle toho, kde appka běží:
//   BASE_URL=https://ar.example.cz node scripts/make-qr.mjs
import fs from 'node:fs'
import QRCode from 'qrcode'

const BASE = (process.env.BASE_URL || 'http://localhost:5199').replace(/\/$/, '')
const exhibits = JSON.parse(fs.readFileSync('data/exhibits-ar.json', 'utf8'))
fs.mkdirSync('qr', { recursive: true })

const cards = []
for (const ex of exhibits) {
  const url = `${BASE}/?e=${ex.key}`
  const svg = await QRCode.toString(url, { type: 'svg', margin: 1, errorCorrectionLevel: 'M' })
  fs.writeFileSync(`qr/${ex.key}.svg`, svg)
  cards.push(`  <figure class="card">
    <img src="qr/${ex.key}.svg" alt="QR kód — ${ex.title}" />
    <figcaption>
      <strong>${ex.title}</strong>
      <span>${ex.period}</span>
      <code>${url}</code>
    </figcaption>
  </figure>`)
  console.log(`qr/${ex.key}.svg  →  ${url}`)
}

fs.writeFileSync('qr.html', `<!DOCTYPE html>
<html lang="cs">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>QR kódy k exponátům</title>
<style>
  body { font-family: system-ui, sans-serif; margin: 32px; color: #1a1a1a; }
  h1 { font-size: 20px; margin-bottom: 6px; }
  .lead { color: #666; font-size: 13px; margin-bottom: 28px; }
  .sheet { display: flex; flex-wrap: wrap; gap: 28px; }
  .card { width: 240px; border: 1px solid #ddd; padding: 16px; text-align: center; margin: 0; }
  .card img { width: 100%; height: auto; }
  figcaption { margin-top: 10px; display: flex; flex-direction: column; gap: 4px; }
  figcaption strong { font-size: 15px; }
  figcaption span { font-size: 12px; color: #666; }
  figcaption code { font-size: 10px; color: #999; word-break: break-all; }
  @media print { body { margin: 12mm; } .lead { display: none; } .card { break-inside: avoid; } }
</style>
</head>
<body>
  <h1>Naskenuj a prohlédni si exponát v prostoru</h1>
  <p class="lead">Vygenerováno pro <code>${BASE}</code> — po nasazení jinam spusť skript znovu s jiným BASE_URL.</p>
  <div class="sheet">
${cards.join('\n')}
  </div>
</body>
</html>
`)
console.log('\ntiskový list: qr.html')
