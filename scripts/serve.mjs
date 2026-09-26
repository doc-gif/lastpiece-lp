// site/ をそのまま配信する小さなサーバー（テストとローカル確認用）。GitHub Pages と同じパス /lastpiece-lp/ で配信する。
import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { extname, join, resolve, sep } from 'node:path'

const root = resolve('site')
const prefix = '/lastpiece-lp/'
const port = Number(process.env.PORT ?? 4180)
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json', '.txt': 'text/plain; charset=utf-8' }

createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname)
    if (pathname === '/' || pathname === prefix.slice(0, -1)) { response.writeHead(302, { Location: prefix }).end(); return }
    if (!pathname.startsWith(prefix)) { response.writeHead(404).end('Not found'); return }
    let path = resolve(root, pathname.slice(prefix.length))
    if (path !== root && !path.startsWith(root + sep)) { response.writeHead(403).end(); return }
    if ((await stat(path)).isDirectory()) path = join(path, 'index.html')
    response.writeHead(200, { 'Content-Type': types[extname(path)] ?? 'application/octet-stream' })
    response.end(await readFile(path))
  } catch {
    response.writeHead(404).end('Not found')
  }
}).listen(port, '127.0.0.1', () => console.log(`http://127.0.0.1:${port}${prefix}`))
