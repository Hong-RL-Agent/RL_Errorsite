import cors from 'cors'
import express from 'express'
import { randomUUID } from 'node:crypto'
import { mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { DatabaseSync } from 'node:sqlite'

const SITE = {"site_id": "error-site-v25", "theme": "게임 길드 커뮤니티", "archetype": "Community", "brand": "Hobby Loop · 게임 길드 커뮤니티", "tagline": "취미를 기록하고 서로의 경험을 나누는 커뮤니티", "resource_label": "게시글", "action_label": "반응 남기기"}
const ENABLED_FAMILIES = new Set(["IDOR", "permission-drift", "stored-xss", "sql-injection", "system-info-disclosure", "security-headers", "idempotency", "async-no-feedback"])
const hasBug = (family) => ENABLED_FAMILIES.has(family)
const seedItems = [["주말 드로잉 모임 후기", "연필 하나로 시작한 90분 드로잉", 12, "✏️"], ["초보 러닝화 추천", "첫 5km를 준비하며 신어본 러닝화", 18, "🏃"], ["집에서 만드는 핸드드립", "분쇄도와 물 온도를 바꿔본 기록", 23, "☕"], ["필름 카메라 입문", "첫 롤에서 배운 세 가지", 31, "📷"], ["한 달 독서 기록", "짧게라도 매일 읽는 루틴", 16, "📚"], ["베란다 허브 키우기", "바질과 로즈마리의 성장 기록", 27, "🪴"]]

const __dirname = dirname(fileURLToPath(import.meta.url))
const dataDirectory = join(__dirname, 'data')
mkdirSync(dataDirectory, { recursive: true })
const database = new DatabaseSync(join(dataDirectory, 'site.sqlite'))

database.exec(`
  PRAGMA foreign_keys = ON;
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user'
  );
  CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    amount INTEGER NOT NULL,
    emoji TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS private_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    owner_id INTEGER NOT NULL,
    label TEXT NOT NULL,
    body TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    owner_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS cart (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    item_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    UNIQUE(user_id, item_id)
  );
  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    kind TEXT NOT NULL,
    amount INTEGER NOT NULL,
    idem_key TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`)

if (database.prepare('SELECT COUNT(*) AS count FROM users').get().count === 0) {
  const q = database.prepare('INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)')
  q.run('userA@test.com', '1234', '테스트 사용자 A', 'user')
  q.run('userB@test.com', '1234', '테스트 사용자 B', 'user')
  q.run('admin@test.com', '1234', '관리자', 'admin')
}
if (database.prepare('SELECT COUNT(*) AS count FROM items').get().count === 0) {
  const q = database.prepare('INSERT INTO items (title, description, amount, emoji) VALUES (?, ?, ?, ?)')
  for (const row of seedItems) q.run(...row)
}
if (database.prepare('SELECT COUNT(*) AS count FROM private_records').get().count === 0) {
  const users = database.prepare('SELECT * FROM users ORDER BY id').all()
  const q = database.prepare('INSERT INTO private_records (owner_id, label, body) VALUES (?, ?, ?)')
  q.run(users[0].id, 'A의 비공개 기록', `${SITE.theme} 테스트용 사용자 A 데이터`)
  q.run(users[1].id, 'B의 비공개 기록', `${SITE.theme} 테스트용 사용자 B 데이터`)
}

const app = express()
const sessions = new Map()
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'] }))
app.use(express.json())

const publicUser = (user) => ({ id: user.id, email: user.email, name: user.name, role: user.role })
const tokenOf = (request) => request.headers.authorization?.replace('Bearer ', '')
const getSession = (request) => {
  const token = tokenOf(request)
  return token ? sessions.get(token) : null
}
const requireUser = (request, response, next) => {
  const session = getSession(request)
  if (!session) return response.status(401).json({ message: '로그인이 필요합니다.' })
  request.session = session
  request.user = database.prepare('SELECT * FROM users WHERE id = ?').get(session.userId)
  next()
}
const requireAdminFromSession = (request, response, next) => {
  if (request.session?.role !== 'admin') return response.status(403).json({ message: '관리자 권한이 필요합니다.' })
  next()
}

app.get('/api/health', (request, response) => response.json({ ok: true, site: SITE.site_id, families: [...ENABLED_FAMILIES] }))
app.get('/api/site', (request, response) => response.json({ site: SITE }))

app.post('/api/auth/login', (request, response) => {
  const { email, password } = request.body ?? {}
  const user = database.prepare('SELECT * FROM users WHERE email = ? AND password = ?').get(email, password)
  if (!user) return response.status(401).json({ message: '이메일 또는 비밀번호를 확인해주세요.' })
  const suppliedSession = request.headers['x-session-id']
  const token = hasBug('session-fixation') && suppliedSession ? String(suppliedSession) : randomUUID()
  // INTENTIONAL_BUG(session-fixation): caller supplied pre-auth session id can survive authentication.
  sessions.set(token, { userId: user.id, role: user.role, issuedAt: Date.now() })
  response.json({ token, session_id: token, user: publicUser(user) })
})

app.post('/api/auth/logout', requireUser, (request, response) => {
  const token = tokenOf(request)
  if (!hasBug('logout-reuse')) sessions.delete(token)
  // INTENTIONAL_BUG(logout-reuse): when enabled, token remains valid after logout.
  response.json({ message: '로그아웃 처리되었습니다.' })
})

app.get('/api/me', requireUser, (request, response) => response.json({ user: publicUser(request.user), session_role: request.session.role }))

app.get('/api/items', (request, response) => {
  const items = database.prepare('SELECT * FROM items ORDER BY id').all()
  response.json({ items })
})

app.post('/api/cart', requireUser, (request, response) => {
  const item = database.prepare('SELECT * FROM items WHERE id = ?').get(Number(request.body?.itemId))
  if (!item) return response.status(404).json({ message: '항목을 찾을 수 없습니다.' })
  database.prepare(`INSERT INTO cart (user_id, item_id, quantity) VALUES (?, ?, 1)
    ON CONFLICT(user_id, item_id) DO UPDATE SET quantity = quantity + 1`).run(request.user.id, item.id)
  response.status(201).json({ message: `${item.title} 항목을 추가했습니다.` })
})

app.get('/api/cart', requireUser, (request, response) => {
  const items = database.prepare(`SELECT cart.item_id, cart.quantity, items.title, items.amount, items.emoji
    FROM cart JOIN items ON items.id = cart.item_id WHERE cart.user_id = ? ORDER BY cart.id DESC`).all(request.user.id)
  response.json({ items })
})

app.get('/api/private-records/:id', requireUser, (request, response) => {
  const record = database.prepare('SELECT * FROM private_records WHERE id = ?').get(Number(request.params.id))
  if (!record) return response.status(404).json({ message: '기록을 찾을 수 없습니다.' })
  if (!hasBug('IDOR') && record.owner_id !== request.user.id) return response.status(403).json({ message: '접근할 수 없습니다.' })
  // INTENTIONAL_BUG(IDOR): owner_id is not checked when the assigned family is enabled.
  response.json({ record })
})

app.get('/api/admin/protected', requireUser, ...(hasBug('vertical-privilege-escalation') ? [] : [requireAdminFromSession]), (request, response) => {
  // INTENTIONAL_BUG(vertical-privilege-escalation): regular authenticated user can receive protected data.
  response.json({ protected: true, area: SITE.theme, internal_fields: ['margin', 'moderation_queue', 'ops_note'] })
})

app.post('/api/admin/demote-self', requireUser, requireAdminFromSession, (request, response) => {
  database.prepare("UPDATE users SET role = 'user' WHERE id = ?").run(request.user.id)
  if (!hasBug('permission-drift')) {
    const token = tokenOf(request)
    const s = sessions.get(token)
    if (s) s.role = 'user'
  }
  response.json({ message: 'DB role을 user로 변경했습니다.', session_role: request.session.role })
})

app.get('/api/admin/privileged', requireUser, requireAdminFromSession, (request, response) => {
  // INTENTIONAL_BUG(permission-drift): cached session role can stay admin after DB demotion.
  response.json({ privileged: true, db_role: request.user.role, cached_role: request.session.role })
})

app.get('/api/echo', (request, response) => {
  const q = String(request.query.q ?? '')
  response.json({ html: hasBug('reflected-xss') ? q : q.replaceAll('<', '&lt;').replaceAll('>', '&gt;') })
})

app.post('/api/notes', requireUser, (request, response) => {
  const content = String(request.body?.content ?? '')
  database.prepare('INSERT INTO notes (owner_id, content) VALUES (?, ?)').run(request.user.id, content)
  response.status(201).json({ message: '저장했습니다.' })
})
app.get('/api/notes', requireUser, (request, response) => {
  const notes = database.prepare('SELECT id, content, created_at FROM notes WHERE owner_id = ? ORDER BY id DESC LIMIT 10').all(request.user.id)
  response.json({ notes, render_as_html: hasBug('stored-xss') })
})

app.get('/api/search', (request, response) => {
  const q = String(request.query.q ?? '')
  try {
    let items
    if (hasBug('sql-injection')) {
      // INTENTIONAL_BUG(sql-injection): direct string interpolation into a SQL predicate.
      const sql = `SELECT * FROM items WHERE title LIKE '%${q}%' ORDER BY id`
      items = database.prepare(sql).all()
    } else {
      items = database.prepare('SELECT * FROM items WHERE title LIKE ? ORDER BY id').all(`%${q}%`)
    }
    response.json({ items, count: items.length })
  } catch (error) {
    response.status(400).json({ message: '검색 조건을 처리하지 못했습니다.' })
  }
})

app.post('/api/parse', (request, response) => {
  const value = request.body?.value
  if (typeof value !== 'number') {
    if (hasBug('system-info-disclosure')) {
      // INTENTIONAL_BUG(system-info-disclosure): internal implementation details are exposed.
      return response.status(500).json({
        message: 'TypeError: expected numeric value',
        internal_path: `${__dirname}/server.js:parseFixture`,
        sql_hint: 'SELECT amount FROM transactions WHERE id = ?'
      })
    }
    return response.status(400).json({ message: '입력 형식이 올바르지 않습니다.' })
  }
  response.json({ parsed: value })
})

app.get('/api/header-check', (request, response) => {
  if (!hasBug('security-headers')) {
    response.setHeader('Content-Security-Policy', "default-src 'self'")
    response.setHeader('Strict-Transport-Security', 'max-age=31536000')
    response.setHeader('X-Content-Type-Options', 'nosniff')
  }
  // INTENTIONAL_BUG(security-headers): assigned sites intentionally omit the policy headers above.
  response.json({ ok: true, site: SITE.site_id })
})

app.post('/api/checkout', requireUser, (request, response) => {
  const cartItems = database.prepare(`SELECT cart.quantity, items.amount FROM cart JOIN items ON items.id = cart.item_id WHERE cart.user_id = ?`).all(request.user.id)
  const serverTotal = cartItems.reduce((sum, row) => sum + row.amount * row.quantity, 0)
  const clientTotal = Number(request.body?.clientTotal ?? serverTotal)
  const approvedTotal = hasBug('price-tampering') ? clientTotal : serverTotal
  // INTENTIONAL_BUG(price-tampering): client supplied amount is trusted when enabled.
  const tx = database.prepare('INSERT INTO transactions (user_id, kind, amount, idem_key) VALUES (?, ?, ?, ?)')
    .run(request.user.id, 'checkout', approvedTotal, null)
  response.status(201).json({ transaction_id: Number(tx.lastInsertRowid), server_total: serverTotal, approved_total: approvedTotal })
})

app.post('/api/transactions', requireUser, (request, response) => {
  const key = String(request.headers['idempotency-key'] ?? '')
  if (!hasBug('idempotency') && key) {
    const existing = database.prepare('SELECT * FROM transactions WHERE user_id = ? AND idem_key = ?').get(request.user.id, key)
    if (existing) return response.json({ transaction: existing, replay: true })
  }
  // INTENTIONAL_BUG(idempotency): same key creates a new row on every request.
  const amount = Number(request.body?.amount ?? 1000)
  const tx = database.prepare('INSERT INTO transactions (user_id, kind, amount, idem_key) VALUES (?, ?, ?, ?)')
    .run(request.user.id, 'fixture', amount, key || null)
  response.status(201).json({ transaction_id: Number(tx.lastInsertRowid), idempotency_key: key || null })
})

app.post('/api/slow-action', requireUser, async (request, response) => {
  const wait = hasBug('async-no-feedback') ? 4500 : 250
  await new Promise((resolve) => setTimeout(resolve, wait))
  response.json({ ok: true, elapsed_ms: wait, label: request.body?.label ?? 'saved' })
})

app.use((request, response) => response.status(404).json({ message: '요청한 경로를 찾을 수 없습니다.' }))

const port = Number(process.env.PORT ?? 3000)
app.listen(port, () => console.log(`${SITE.site_id} backend listening on http://localhost:${port}`))
