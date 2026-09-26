// 使い方: pnpm qr <https URL> <出力先.png>
import { writeFile } from 'node:fs/promises'
import QRCode from 'qrcode'

const [url, out = 'qr.png'] = process.argv.slice(2)
if (!url || !/^https:\/\//.test(url)) { console.error('確認済みの https URL を指定してください'); process.exit(1) }
await writeFile(out, await QRCode.toBuffer(url, { type: 'png', errorCorrectionLevel: 'M', margin: 2, scale: 8 }))
console.log(`${out} <- ${url}`)
