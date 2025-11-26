import http from 'node:http'
import { URL } from 'node:url'

const whispers = [
  'Settlers are packing their enchanted wagons—routes open soon.',
  'Mystic dice are warming up; fortune favors the playful.',
  'Guilds are drafting trade pacts for the bravest builders.',
  'Dragons nap on the horizon; they only wake for grand openings.',
  'A breeze carries rumors of glowing harbors and moonlit sheep.',
  'Merchants whisper of crystalline ore hidden in foggy forests.',
]

const port = process.env.PORT || 4177

function sendJson(res, statusCode, body) {
  const payload = JSON.stringify(body)
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
  })
  res.end(payload)
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`)

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
    })
    res.end()
    return
  }

  if (req.method === 'GET' && url.pathname === '/api/whispers') {
    sendJson(res, 200, { whispers })
    return
  }

  if (req.method === 'GET' && url.pathname === '/api/health') {
    sendJson(res, 200, { status: 'ok' })
    return
  }

  sendJson(res, 404, { error: 'Not Found' })
})

server.listen(port, () => {
  console.log(`Whisper API running on http://localhost:${port}`)
})
