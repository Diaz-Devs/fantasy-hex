import http from 'node:http'
import { URL } from 'node:url'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const whispers = [
  'Settlers are packing their enchanted wagons—routes open soon.',
  'Mystic dice are warming up; fortune favors the playful.',
  'Guilds are drafting trade pacts for the bravest builders.',
  'Dragons nap on the horizon; they only wake for grand openings.',
  'A breeze carries rumors of glowing harbors and moonlit sheep.',
  'Merchants whisper of crystalline ore hidden in foggy forests.',
]

const port = process.env.PORT || 4177

const usersFile = join(__dirname, '..', 'data', 'users.json')
const friendsFile = join(__dirname, '..', 'data', 'friends.json')

function readJsonFile(filePath) {
  try {
    if (!existsSync(filePath)) {
      return []
    }
    const data = readFileSync(filePath, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error)
    return []
  }
}

function writeJsonFile(filePath, data) {
  try {
    writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8')
    return true
  } catch (error) {
    console.error(`Error writing ${filePath}:`, error)
    return false
  }
}

function sendJson(res, statusCode, body) {
  const payload = JSON.stringify(body)
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  })
  res.end(payload)
}

function getBody(req) {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', chunk => {
      body += chunk.toString()
    })
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {})
      } catch (error) {
        reject(error)
      }
    })
    req.on('error', reject)
  })
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

  // User endpoints
  if (req.method === 'GET' && url.pathname === '/api/users') {
    const users = readJsonFile(usersFile)
    const email = url.searchParams.get('email')
    if (email) {
      const user = users.find(u => u.email === email)
      sendJson(res, 200, { user: user || null })
      return
    }
    sendJson(res, 200, { users })
    return
  }

  if (req.method === 'POST' && url.pathname === '/api/users') {
    getBody(req).then(async (body) => {
      const users = readJsonFile(usersFile)
      const { email, name, picture, username, auth0Id } = body
      
      if (!email || !auth0Id) {
        sendJson(res, 400, { error: 'Email and auth0Id are required' })
        return
      }

      // Check if user exists
      let user = users.find(u => u.auth0Id === auth0Id || u.email === email)
      
      if (user) {
        // Update existing user
        user.name = name || user.name
        user.picture = picture || user.picture
        user.username = username || user.username
        user.updatedAt = new Date().toISOString()
      } else {
        // Create new user
        user = {
          id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          auth0Id,
          email,
          name: name || email.split('@')[0],
          picture: picture || null,
          username: username || null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        users.push(user)
      }

      if (writeJsonFile(usersFile, users)) {
        sendJson(res, 200, { user })
      } else {
        sendJson(res, 500, { error: 'Failed to save user' })
      }
    }).catch(error => {
      sendJson(res, 400, { error: 'Invalid request body' })
    })
    return
  }

  // Friends endpoints
  if (req.method === 'GET' && url.pathname === '/api/friends') {
    const friends = readJsonFile(friendsFile)
    const userId = url.searchParams.get('userId')
    if (userId) {
      const userFriends = friends.filter(f => 
        f.userId === userId || f.friendId === userId
      )
      sendJson(res, 200, { friends: userFriends })
      return
    }
    sendJson(res, 200, { friends })
    return
  }

  if (req.method === 'POST' && url.pathname === '/api/friends') {
    getBody(req).then(async (body) => {
      const friends = readJsonFile(friendsFile)
      const { userId, friendId } = body
      
      if (!userId || !friendId) {
        sendJson(res, 400, { error: 'userId and friendId are required' })
        return
      }

      // Check if friendship already exists
      const exists = friends.find(f => 
        (f.userId === userId && f.friendId === friendId) ||
        (f.userId === friendId && f.friendId === userId)
      )

      if (exists) {
        sendJson(res, 400, { error: 'Friendship already exists' })
        return
      }

      const friendship = {
        id: `friend_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        friendId,
        status: 'accepted',
        createdAt: new Date().toISOString()
      }

      friends.push(friendship)

      if (writeJsonFile(friendsFile, friends)) {
        sendJson(res, 200, { friendship })
      } else {
        sendJson(res, 500, { error: 'Failed to save friendship' })
      }
    }).catch(error => {
      sendJson(res, 400, { error: 'Invalid request body' })
    })
    return
  }

  // Search users by username
  if (req.method === 'GET' && url.pathname === '/api/users/search') {
    const users = readJsonFile(usersFile)
    const query = url.searchParams.get('q')
    if (!query) {
      sendJson(res, 400, { error: 'Search query is required' })
      return
    }

    const results = users.filter(u => 
      u.username && u.username.toLowerCase().includes(query.toLowerCase())
    ).map(u => ({
      id: u.id,
      username: u.username,
      name: u.name,
      picture: u.picture
    }))

    sendJson(res, 200, { users: results })
    return
  }

  sendJson(res, 404, { error: 'Not Found' })
})

server.listen(port, () => {
  console.log(`Whisper API running on http://localhost:${port}`)
})
