from __future__ import annotations
import json, shutil, textwrap, re, os
from pathlib import Path

ROOT = Path(__file__).resolve().parent
MANIFEST = ROOT / 'sites_manifest_v1.json'
OUT = ROOT
V1 = ROOT / 'templates' / 'base'

with MANIFEST.open(encoding='utf-8') as f:
    manifest = json.load(f)

(OUT / 'generated').mkdir(exist_ok=True)

ARCHETYPE = {
    'Commerce': {
        'brand': 'Paper & Day',
        'tagline': '작고 유용한 물건을 고르는 온라인 스토어',
        'accent': '#b45309',
        'soft': '#fff7ed',
        'resource_label': '상품',
        'action_label': '장바구니 담기',
        'items': [
            ['그리드 노트', '매일 기록하기 좋은 하드커버 노트', 12000, '📓'],
            ['브라스 펜', '무게감 있는 금속 바디 펜', 18000, '🖊️'],
            ['데스크 트레이', '작은 물건을 정리하는 트레이', 22000, '🗂️'],
            ['클립 세트', '메모와 문서를 위한 컬러 클립', 7000, '📎'],
            ['위클리 플래너', '한 주를 한눈에 보는 플래너', 15000, '🗓️'],
            ['북마크 세트', '얇고 단정한 금속 북마크', 9000, '🔖'],
        ],
    },
    'Booking': {
        'brand': 'Stayline',
        'tagline': '일정과 취향에 맞는 숙소를 빠르게 예약하세요',
        'accent': '#0f766e',
        'soft': '#f0fdfa',
        'resource_label': '객실',
        'action_label': '예약하기',
        'items': [
            ['리버뷰 스튜디오', '강 전망과 퀸베드가 있는 객실', 138000, '🌊'],
            ['시티 트윈룸', '출장과 짧은 여행에 적합한 트윈룸', 112000, '🏙️'],
            ['가든 테라스', '작은 테라스와 정원이 연결된 객실', 164000, '🌿'],
            ['패밀리 스위트', '4인 가족을 위한 넓은 스위트', 219000, '🛋️'],
            ['컴팩트 싱글', '혼자 머물기 좋은 실용적인 객실', 88000, '🛏️'],
            ['루프탑 로프트', '높은 층고와 야경을 즐기는 로프트', 196000, '🌃'],
        ],
    },
    'Community': {
        'brand': 'Hobby Loop',
        'tagline': '취미를 기록하고 서로의 경험을 나누는 커뮤니티',
        'accent': '#7c3aed',
        'soft': '#f5f3ff',
        'resource_label': '게시글',
        'action_label': '반응 남기기',
        'items': [
            ['주말 드로잉 모임 후기', '연필 하나로 시작한 90분 드로잉', 12, '✏️'],
            ['초보 러닝화 추천', '첫 5km를 준비하며 신어본 러닝화', 18, '🏃'],
            ['집에서 만드는 핸드드립', '분쇄도와 물 온도를 바꿔본 기록', 23, '☕'],
            ['필름 카메라 입문', '첫 롤에서 배운 세 가지', 31, '📷'],
            ['한 달 독서 기록', '짧게라도 매일 읽는 루틴', 16, '📚'],
            ['베란다 허브 키우기', '바질과 로즈마리의 성장 기록', 27, '🪴'],
        ],
    },
    'Dashboard': {
        'brand': 'Flowboard',
        'tagline': '프로젝트의 진행 상황과 작업 흐름을 한 화면에서',
        'accent': '#2563eb',
        'soft': '#eff6ff',
        'resource_label': '프로젝트',
        'action_label': '작업 생성',
        'items': [
            ['홈페이지 리뉴얼', '디자인 시스템과 주요 화면 개편', 68, '🧩'],
            ['결제 플로우 개선', '체크아웃 단계 단축 및 오류 처리', 44, '💳'],
            ['모바일 접근성', '키보드·스크린리더 테스트', 81, '📱'],
            ['고객지원 대시보드', '상담 현황과 SLA 시각화', 36, '🎧'],
            ['검색 품질 개선', '필터와 정렬 UX 개선', 57, '🔎'],
            ['온보딩 자동화', '신규 사용자 가이드 및 체크리스트', 72, '🚀'],
        ],
    },
    'Learning': {
        'brand': 'Classroom 27',
        'tagline': '짧게 배우고 바로 실습하는 온라인 강의 플랫폼',
        'accent': '#be123c',
        'soft': '#fff1f2',
        'resource_label': '강의',
        'action_label': '수강 시작',
        'items': [
            ['React 기초', '컴포넌트와 상태 관리부터 시작하기', 49000, '⚛️'],
            ['SQL 데이터 조회', 'SELECT부터 JOIN까지 실습 중심 과정', 42000, '🗄️'],
            ['웹 접근성', '시맨틱 마크업과 키보드 탐색', 36000, '♿'],
            ['Git 협업', '브랜치·PR·충돌 해결 워크플로', 39000, '🌿'],
            ['API 설계', 'REST API의 자원·상태코드 설계', 52000, '🔌'],
            ['테스트 자동화', '브라우저 테스트와 리포트 작성', 55000, '🧪'],
        ],
    },
}

FAMILY_SCOPE = {
    'IDOR': 'API_ONLY',
    'vertical-privilege-escalation': 'API_ONLY',
    'permission-drift': 'API_ONLY',
    'reflected-xss': 'UI',
    'stored-xss': 'UI',
    'sql-injection': 'API_ONLY',
    'system-info-disclosure': 'API_ONLY',
    'session-fixation': 'API_ONLY',
    'logout-reuse': 'API_ONLY',
    'security-headers': 'API_ONLY',
    'price-tampering': 'UI_TRIGGER_API_UI_VERIFY',
    'idempotency': 'API_ONLY',
    'async-no-feedback': 'UI',
}

FAMILY_ENDPOINT = {
    'IDOR': 'GET /api/private-records/:id',
    'vertical-privilege-escalation': 'GET /api/admin/protected',
    'permission-drift': 'POST /api/admin/demote-self → GET /api/admin/privileged',
    'reflected-xss': 'GET /api/echo?q=<marker>',
    'stored-xss': 'POST /api/notes → GET /api/notes',
    'sql-injection': 'GET /api/search?q=<condition>',
    'system-info-disclosure': 'POST /api/parse',
    'session-fixation': 'POST /api/auth/login with X-Session-Id',
    'logout-reuse': 'POST /api/auth/logout → protected API retry',
    'security-headers': 'GET /api/header-check',
    'price-tampering': 'POST /api/checkout',
    'idempotency': 'POST /api/transactions (same Idempotency-Key twice)',
    'async-no-feedback': 'POST /api/slow-action',
}

FAMILY_EXPECTED = {
    'IDOR': '다른 사용자의 자원은 403 또는 404로 차단되어야 한다.',
    'vertical-privilege-escalation': '일반 사용자는 관리자 API에서 403을 받아야 한다.',
    'permission-drift': '권한 회수 직후 기존 세션도 새 권한을 반영해야 한다.',
    'reflected-xss': '사용자 입력은 HTML 실행 문맥이 아닌 텍스트로 안전하게 표시되어야 한다.',
    'stored-xss': '저장된 사용자 입력은 재조회 후에도 실행 가능한 HTML로 해석되지 않아야 한다.',
    'sql-injection': '검색 조건은 파라미터 바인딩되어 입력이 SQL 구조를 변경하지 않아야 한다.',
    'system-info-disclosure': '오류 응답은 내부 경로·SQL·stack trace를 노출하지 않아야 한다.',
    'session-fixation': '로그인 성공 시 인증 전 세션 식별자와 다른 새 세션을 발급해야 한다.',
    'logout-reuse': '로그아웃된 토큰은 이후 보호 API 호출에 사용할 수 없어야 한다.',
    'security-headers': '필수 보안 응답 헤더 정책을 적용해야 한다.',
    'price-tampering': '결제 금액은 서버가 장바구니/상품 데이터로 재계산해야 한다.',
    'idempotency': '동일 idempotency key의 재시도는 동일 거래 결과를 반환해야 한다.',
    'async-no-feedback': '지연 요청 동안 로딩/진행/취소 등 사용자 피드백이 제공되어야 한다.',
}

FAMILY_BUGGY = {
    'IDOR': 'owner 검증 없이 ID만으로 다른 사용자의 자원을 200으로 반환한다.',
    'vertical-privilege-escalation': '관리자 전용 경로가 일반 로그인 사용자에게도 200으로 열린다.',
    'permission-drift': 'DB 권한을 회수해도 세션에 캐시된 이전 관리자 권한이 계속 사용된다.',
    'reflected-xss': '응답의 사용자 입력을 프론트엔드가 dangerouslySetInnerHTML로 렌더링한다.',
    'stored-xss': '저장된 note 내용을 프론트엔드가 dangerouslySetInnerHTML로 재렌더링한다.',
    'sql-injection': '검색어를 SQL 문자열에 직접 결합하여 조건식이 쿼리 구조에 영향을 줄 수 있다.',
    'system-info-disclosure': '형식 오류 요청에 내부 파일 경로와 SQL/stack 힌트를 포함한 디버그 정보를 반환한다.',
    'session-fixation': 'X-Session-Id로 전달된 인증 전 세션 ID를 로그인 뒤에도 그대로 사용한다.',
    'logout-reuse': '로그아웃 응답은 성공하지만 서버 세션 Map에서 토큰을 제거하지 않는다.',
    'security-headers': 'header-check 응답에서 CSP/HSTS/X-Content-Type-Options가 의도적으로 누락된다.',
    'price-tampering': 'checkout이 clientTotal을 검증하지 않고 주문 금액으로 저장한다.',
    'idempotency': '같은 Idempotency-Key로 요청해도 매번 새 거래를 생성한다.',
    'async-no-feedback': '약 4.5초 pending 동안 버튼 비활성화·spinner·취소 UI가 전혀 나타나지 않는다.',
}


def slug(s: str) -> str:
    return re.sub(r'[^a-z0-9]+', '-', s.lower()).strip('-') or 'site'


def site_data(site):
    base = ARCHETYPE[site['archetype']]
    d = dict(base)
    d.update({
        'site_id': site['site_id'],
        'theme': site['theme'],
        'archetype': site['archetype'],
        'layout_variant': site['layout_variant'],
        'dom_variant': site['dom_variant'],
    })
    # Make brand visibly theme-specific while retaining archetype feel.
    d['brand'] = f"{base['brand']} · {site['theme']}"
    return d


def bug_runtime(site):
    result = []
    for idx, b in enumerate(site['bugs'], 1):
        fam = b['vulnerability_family']
        result.append({
            'bug_id': f"{site['site_id'].upper()}-BUG-{idx:02d}",
            'source_id': b['source_id'],
            'category': b['category'],
            'vulnerability_family': fam,
            'source_error_name': b['error_name'],
            'reproduction_scope': FAMILY_SCOPE[fam],
            'trigger': FAMILY_ENDPOINT[fam],
            'expected_normal_behavior': FAMILY_EXPECTED[fam],
            'intentional_buggy_behavior': FAMILY_BUGGY[fam],
            'evidence_required': b['evidence_required'],
            'oracle_required': b['oracle_required'],
            'safe_fixture': b['safe_fixture'],
            'source_target_action': b['target_action'],
            'source_reference': b['source_reference'],
            'priority': b['priority'],
            'severity': b['severity'],
        })
    return result


def generate_server(site, config, bugs):
    families = [b['vulnerability_family'] for b in bugs]
    items_js = json.dumps(config['items'], ensure_ascii=False)
    config_js = json.dumps({k: config[k] for k in ['site_id','theme','archetype','brand','tagline','resource_label','action_label']}, ensure_ascii=False)
    families_js = json.dumps(families, ensure_ascii=False)
    return f"""import cors from 'cors'
import express from 'express'
import {{ randomUUID }} from 'node:crypto'
import {{ mkdirSync }} from 'node:fs'
import {{ dirname, join }} from 'node:path'
import {{ fileURLToPath }} from 'node:url'
import {{ DatabaseSync }} from 'node:sqlite'

const SITE = {config_js}
const ENABLED_FAMILIES = new Set({families_js})
const hasBug = (family) => ENABLED_FAMILIES.has(family)
const seedItems = {items_js}

const __dirname = dirname(fileURLToPath(import.meta.url))
const dataDirectory = join(__dirname, 'data')
mkdirSync(dataDirectory, {{ recursive: true }})
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

if (database.prepare('SELECT COUNT(*) AS count FROM users').get().count === 0) {{
  const q = database.prepare('INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)')
  q.run('userA@test.com', '1234', '테스트 사용자 A', 'user')
  q.run('userB@test.com', '1234', '테스트 사용자 B', 'user')
  q.run('admin@test.com', '1234', '관리자', 'admin')
}}
if (database.prepare('SELECT COUNT(*) AS count FROM items').get().count === 0) {{
  const q = database.prepare('INSERT INTO items (title, description, amount, emoji) VALUES (?, ?, ?, ?)')
  for (const row of seedItems) q.run(...row)
}}
if (database.prepare('SELECT COUNT(*) AS count FROM private_records').get().count === 0) {{
  const users = database.prepare('SELECT * FROM users ORDER BY id').all()
  const q = database.prepare('INSERT INTO private_records (owner_id, label, body) VALUES (?, ?, ?)')
  q.run(users[0].id, 'A의 비공개 기록', `${{SITE.theme}} 테스트용 사용자 A 데이터`)
  q.run(users[1].id, 'B의 비공개 기록', `${{SITE.theme}} 테스트용 사용자 B 데이터`)
}}

const app = express()
const sessions = new Map()
app.use(cors({{ origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'] }}))
app.use(express.json())

const publicUser = (user) => ({{ id: user.id, email: user.email, name: user.name, role: user.role }})
const tokenOf = (request) => request.headers.authorization?.replace('Bearer ', '')
const getSession = (request) => {{
  const token = tokenOf(request)
  return token ? sessions.get(token) : null
}}
const requireUser = (request, response, next) => {{
  const session = getSession(request)
  if (!session) return response.status(401).json({{ message: '로그인이 필요합니다.' }})
  request.session = session
  request.user = database.prepare('SELECT * FROM users WHERE id = ?').get(session.userId)
  next()
}}
const requireAdminFromSession = (request, response, next) => {{
  if (request.session?.role !== 'admin') return response.status(403).json({{ message: '관리자 권한이 필요합니다.' }})
  next()
}}

app.get('/api/health', (request, response) => response.json({{ ok: true, site: SITE.site_id, families: [...ENABLED_FAMILIES] }}))
app.get('/api/site', (request, response) => response.json({{ site: SITE }}))

app.post('/api/auth/login', (request, response) => {{
  const {{ email, password }} = request.body ?? {{}}
  const user = database.prepare('SELECT * FROM users WHERE email = ? AND password = ?').get(email, password)
  if (!user) return response.status(401).json({{ message: '이메일 또는 비밀번호를 확인해주세요.' }})
  const suppliedSession = request.headers['x-session-id']
  const token = hasBug('session-fixation') && suppliedSession ? String(suppliedSession) : randomUUID()
  // INTENTIONAL_BUG(session-fixation): caller supplied pre-auth session id can survive authentication.
  sessions.set(token, {{ userId: user.id, role: user.role, issuedAt: Date.now() }})
  response.json({{ token, session_id: token, user: publicUser(user) }})
}})

app.post('/api/auth/logout', requireUser, (request, response) => {{
  const token = tokenOf(request)
  if (!hasBug('logout-reuse')) sessions.delete(token)
  // INTENTIONAL_BUG(logout-reuse): when enabled, token remains valid after logout.
  response.json({{ message: '로그아웃 처리되었습니다.' }})
}})

app.get('/api/me', requireUser, (request, response) => response.json({{ user: publicUser(request.user), session_role: request.session.role }}))

app.get('/api/items', (request, response) => {{
  const items = database.prepare('SELECT * FROM items ORDER BY id').all()
  response.json({{ items }})
}})

app.post('/api/cart', requireUser, (request, response) => {{
  const item = database.prepare('SELECT * FROM items WHERE id = ?').get(Number(request.body?.itemId))
  if (!item) return response.status(404).json({{ message: '항목을 찾을 수 없습니다.' }})
  database.prepare(`INSERT INTO cart (user_id, item_id, quantity) VALUES (?, ?, 1)
    ON CONFLICT(user_id, item_id) DO UPDATE SET quantity = quantity + 1`).run(request.user.id, item.id)
  response.status(201).json({{ message: `${{item.title}} 항목을 추가했습니다.` }})
}})

app.get('/api/cart', requireUser, (request, response) => {{
  const items = database.prepare(`SELECT cart.item_id, cart.quantity, items.title, items.amount, items.emoji
    FROM cart JOIN items ON items.id = cart.item_id WHERE cart.user_id = ? ORDER BY cart.id DESC`).all(request.user.id)
  response.json({{ items }})
}})

app.get('/api/private-records/:id', requireUser, (request, response) => {{
  const record = database.prepare('SELECT * FROM private_records WHERE id = ?').get(Number(request.params.id))
  if (!record) return response.status(404).json({{ message: '기록을 찾을 수 없습니다.' }})
  if (!hasBug('IDOR') && record.owner_id !== request.user.id) return response.status(403).json({{ message: '접근할 수 없습니다.' }})
  // INTENTIONAL_BUG(IDOR): owner_id is not checked when the assigned family is enabled.
  response.json({{ record }})
}})

app.get('/api/admin/protected', requireUser, ...(hasBug('vertical-privilege-escalation') ? [] : [requireAdminFromSession]), (request, response) => {{
  // INTENTIONAL_BUG(vertical-privilege-escalation): regular authenticated user can receive protected data.
  response.json({{ protected: true, area: SITE.theme, internal_fields: ['margin', 'moderation_queue', 'ops_note'] }})
}})

app.post('/api/admin/demote-self', requireUser, requireAdminFromSession, (request, response) => {{
  database.prepare("UPDATE users SET role = 'user' WHERE id = ?").run(request.user.id)
  if (!hasBug('permission-drift')) {{
    const token = tokenOf(request)
    const s = sessions.get(token)
    if (s) s.role = 'user'
  }}
  response.json({{ message: 'DB role을 user로 변경했습니다.', session_role: request.session.role }})
}})

app.get('/api/admin/privileged', requireUser, requireAdminFromSession, (request, response) => {{
  // INTENTIONAL_BUG(permission-drift): cached session role can stay admin after DB demotion.
  response.json({{ privileged: true, db_role: request.user.role, cached_role: request.session.role }})
}})

app.get('/api/echo', (request, response) => {{
  const q = String(request.query.q ?? '')
  response.json({{ html: hasBug('reflected-xss') ? q : q.replaceAll('<', '&lt;').replaceAll('>', '&gt;') }})
}})

app.post('/api/notes', requireUser, (request, response) => {{
  const content = String(request.body?.content ?? '')
  database.prepare('INSERT INTO notes (owner_id, content) VALUES (?, ?)').run(request.user.id, content)
  response.status(201).json({{ message: '저장했습니다.' }})
}})
app.get('/api/notes', requireUser, (request, response) => {{
  const notes = database.prepare('SELECT id, content, created_at FROM notes WHERE owner_id = ? ORDER BY id DESC LIMIT 10').all(request.user.id)
  response.json({{ notes, render_as_html: hasBug('stored-xss') }})
}})

app.get('/api/search', (request, response) => {{
  const q = String(request.query.q ?? '')
  try {{
    let items
    if (hasBug('sql-injection')) {{
      // INTENTIONAL_BUG(sql-injection): direct string interpolation into a SQL predicate.
      const sql = `SELECT * FROM items WHERE title LIKE '%${{q}}%' ORDER BY id`
      items = database.prepare(sql).all()
    }} else {{
      items = database.prepare('SELECT * FROM items WHERE title LIKE ? ORDER BY id').all(`%${{q}}%`)
    }}
    response.json({{ items, count: items.length }})
  }} catch (error) {{
    response.status(400).json({{ message: '검색 조건을 처리하지 못했습니다.' }})
  }}
}})

app.post('/api/parse', (request, response) => {{
  const value = request.body?.value
  if (typeof value !== 'number') {{
    if (hasBug('system-info-disclosure')) {{
      // INTENTIONAL_BUG(system-info-disclosure): internal implementation details are exposed.
      return response.status(500).json({{
        message: 'TypeError: expected numeric value',
        internal_path: `${{__dirname}}/server.js:parseFixture`,
        sql_hint: 'SELECT amount FROM transactions WHERE id = ?'
      }})
    }}
    return response.status(400).json({{ message: '입력 형식이 올바르지 않습니다.' }})
  }}
  response.json({{ parsed: value }})
}})

app.get('/api/header-check', (request, response) => {{
  if (!hasBug('security-headers')) {{
    response.setHeader('Content-Security-Policy', "default-src 'self'")
    response.setHeader('Strict-Transport-Security', 'max-age=31536000')
    response.setHeader('X-Content-Type-Options', 'nosniff')
  }}
  // INTENTIONAL_BUG(security-headers): assigned sites intentionally omit the policy headers above.
  response.json({{ ok: true, site: SITE.site_id }})
}})

app.post('/api/checkout', requireUser, (request, response) => {{
  const cartItems = database.prepare(`SELECT cart.quantity, items.amount FROM cart JOIN items ON items.id = cart.item_id WHERE cart.user_id = ?`).all(request.user.id)
  const serverTotal = cartItems.reduce((sum, row) => sum + row.amount * row.quantity, 0)
  const clientTotal = Number(request.body?.clientTotal ?? serverTotal)
  const approvedTotal = hasBug('price-tampering') ? clientTotal : serverTotal
  // INTENTIONAL_BUG(price-tampering): client supplied amount is trusted when enabled.
  const tx = database.prepare('INSERT INTO transactions (user_id, kind, amount, idem_key) VALUES (?, ?, ?, ?)')
    .run(request.user.id, 'checkout', approvedTotal, null)
  response.status(201).json({{ transaction_id: Number(tx.lastInsertRowid), server_total: serverTotal, approved_total: approvedTotal }})
}})

app.post('/api/transactions', requireUser, (request, response) => {{
  const key = String(request.headers['idempotency-key'] ?? '')
  if (!hasBug('idempotency') && key) {{
    const existing = database.prepare('SELECT * FROM transactions WHERE user_id = ? AND idem_key = ?').get(request.user.id, key)
    if (existing) return response.json({{ transaction: existing, replay: true }})
  }}
  // INTENTIONAL_BUG(idempotency): same key creates a new row on every request.
  const amount = Number(request.body?.amount ?? 1000)
  const tx = database.prepare('INSERT INTO transactions (user_id, kind, amount, idem_key) VALUES (?, ?, ?, ?)')
    .run(request.user.id, 'fixture', amount, key || null)
  response.status(201).json({{ transaction_id: Number(tx.lastInsertRowid), idempotency_key: key || null }})
}})

app.post('/api/slow-action', requireUser, async (request, response) => {{
  const wait = hasBug('async-no-feedback') ? 4500 : 250
  await new Promise((resolve) => setTimeout(resolve, wait))
  response.json({{ ok: true, elapsed_ms: wait, label: request.body?.label ?? 'saved' }})
}})

app.use((request, response) => response.status(404).json({{ message: '요청한 경로를 찾을 수 없습니다.' }}))

const port = Number(process.env.PORT ?? 3000)
app.listen(port, () => console.log(`${{SITE.site_id}} backend listening on http://localhost:${{port}}`))
"""


def generate_app(site, config, bugs):
    cfg = json.dumps({k: config[k] for k in ['site_id','theme','archetype','brand','tagline','resource_label','action_label','layout_variant','dom_variant']}, ensure_ascii=False)
    families = json.dumps([b['vulnerability_family'] for b in bugs], ensure_ascii=False)
    return f"""import {{ useEffect, useMemo, useState }} from 'react'
import './App.css'

const SITE = {cfg}
const BUG_FAMILIES = new Set({families})
const API = 'http://localhost:3000/api'

async function api(path, options = {{}}, token, extraHeaders = {{}}) {{
  const response = await fetch(`${{API}}${{path}}`, {{
    ...options,
    headers: {{
      'Content-Type': 'application/json',
      ...(token ? {{ Authorization: `Bearer ${{token}}` }} : {{}}),
      ...extraHeaders,
      ...(options.headers ?? {{}}),
    }},
  }})
  const data = await response.json().catch(() => ({{}}))
  if (!response.ok) throw Object.assign(new Error(data.message ?? '요청 실패'), {{ status: response.status, data }})
  return data
}}

const won = (n) => SITE.archetype === 'Community' || SITE.archetype === 'Dashboard' ? `${{n}}` : `${{Number(n).toLocaleString('ko-KR')}}원`

function Login({{ onLogin }}) {{
  const [email, setEmail] = useState('userA@test.com')
  const [password, setPassword] = useState('1234')
  const [error, setError] = useState('')
  const submit = async (e) => {{
    e.preventDefault(); setError('')
    try {{
      const data = await api('/auth/login', {{ method: 'POST', body: JSON.stringify({{ email, password }}) }})
      onLogin(data)
    }} catch (err) {{ setError(err.message) }}
  }}
  return <main className="login-shell">
    <section className="login-card">
      <div className="brand-dot">{{SITE.brand.slice(0,1)}}</div>
      <p className="eyebrow">{{SITE.site_id}} · {{SITE.archetype}}</p>
      <h1>{{SITE.brand}}</h1>
      <p className="muted">{{SITE.tagline}}</p>
      <form onSubmit={{submit}}>
        <label>이메일<input value={{email}} onChange={{e=>setEmail(e.target.value)}} /></label>
        <label>비밀번호<input type="password" value={{password}} onChange={{e=>setPassword(e.target.value)}} /></label>
        {{error && <p className="error">{{error}}</p>}}
        <button className="primary">로그인</button>
      </form>
      <div className="demo"><b>테스트 계정</b><br/>userA@test.com / 1234<br/>userB@test.com / 1234<br/>admin@test.com / 1234</div>
    </section>
  </main>
}}

function CommerceView({{ items, token, notify }}) {{
  const [cart, setCart] = useState([])
  const add = async (id) => {{ await api('/cart', {{method:'POST', body:JSON.stringify({{itemId:id}})}}, token); notify('장바구니에 추가했습니다.'); refresh() }}
  const refresh = async () => setCart((await api('/cart', {{}}, token)).items)
  useEffect(()=>{{refresh()}}, [])
  return <>
    <section className="hero commerce-hero"><div><p className="eyebrow">CURATED STATIONERY</p><h2>{{SITE.theme}}</h2><p>{{SITE.tagline}}</p></div><div className="hero-stat"><b>{{items.length}}</b><span>오늘의 셀렉션</span></div></section>
    <section className="cards commerce-grid">{{items.map(item => <article className="product-card" key={{item.id}}><div className="visual">{{item.emoji}}</div><div className="row"><div><h3>{{item.title}}</h3><p>{{item.description}}</p></div><strong>{{won(item.amount)}}</strong></div><button onClick={{()=>add(item.id)}}>{{SITE.action_label}}</button></article>)}}</section>
    <aside className="mini-panel"><span>장바구니</span><b>{{cart.reduce((n,x)=>n+x.quantity,0)}}개</b></aside>
  </>
}}

function BookingView({{ items, token, notify }}) {{
  const [selected, setSelected] = useState(items[0]?.id)
  return <>
    <section className="hero booking-hero"><div><p className="eyebrow">FIND YOUR STAY</p><h2>{{SITE.theme}}</h2><p>{{SITE.tagline}}</p></div><div className="search-box"><span>체크인</span><b>10. 04</b><span>2명</span></div></section>
    <div className="booking-layout"><div className="booking-list">{{items.map(item => <button className={{selected===item.id?'stay-row active':'stay-row'}} onClick={{()=>setSelected(item.id)}} key={{item.id}}><span className="stay-emoji">{{item.emoji}}</span><span><b>{{item.title}}</b><small>{{item.description}}</small></span><strong>{{won(item.amount)}}</strong></button>)}}</div><aside className="booking-detail"><p className="eyebrow">RESERVATION</p><h3>{{items.find(x=>x.id===selected)?.title}}</h3><p>무료 취소 · 체크인 15:00</p><button className="primary" onClick={{()=>notify('예약 요청을 준비했습니다.')}}>{{SITE.action_label}}</button></aside></div>
  </>
}}

function CommunityView({{ items }}) {{
  return <div className="community-layout"><section><div className="hero compact"><div><p className="eyebrow">TODAY'S LOOP</p><h2>{{SITE.theme}}</h2><p>{{SITE.tagline}}</p></div></div><div className="feed">{{items.map(item=><article className="post" key={{item.id}}><div className="avatar">{{item.emoji}}</div><div><small>@member{{item.id}}</small><h3>{{item.title}}</h3><p>{{item.description}}</p><div className="post-meta">좋아요 {{item.amount}} · 댓글 {{item.id+2}}</div></div></article>)}}</div></section><aside className="topic-panel"><p className="eyebrow">TOPICS</p><b>#주말취미</b><b>#기록</b><b>#초보환영</b><b>#모임후기</b></aside></div>
}}

function DashboardView({{ items }}) {{
  return <><section className="dash-head"><div><p className="eyebrow">WORKSPACE</p><h2>{{SITE.theme}}</h2><p>{{SITE.tagline}}</p></div><button className="primary small">새 작업</button></section><div className="metrics"><div><span>진행 프로젝트</span><b>6</b></div><div><span>이번 주 완료</span><b>14</b></div><div><span>지연</span><b>2</b></div></div><section className="project-table"><div className="table-head"><span>프로젝트</span><span>진행률</span><span>상태</span></div>{{items.map(item=><div className="project-row" key={{item.id}}><span><i>{{item.emoji}}</i><b>{{item.title}}</b><small>{{item.description}}</small></span><span><div className="progress"><i style={{{{width:`${{item.amount}}%`}}}}></i></div>{{item.amount}}%</span><span><em>{{item.amount>70?'안정':'진행 중'}}</em></span></div>)}}</section></>
}}

function LearningView({{ items, notify }}) {{
  return <><section className="hero learning-hero"><div><p className="eyebrow">LEARN · BUILD · REPEAT</p><h2>{{SITE.theme}}</h2><p>{{SITE.tagline}}</p></div><div className="hero-badge">이번 주<br/><b>3강</b></div></section><section className="course-grid">{{items.map((item,idx)=><article className="course" key={{item.id}}><div className="course-cover"><span>{{item.emoji}}</span><small>0{{idx+1}}</small></div><p className="eyebrow">COURSE</p><h3>{{item.title}}</h3><p>{{item.description}}</p><div className="row"><strong>{{won(item.amount)}}</strong><button onClick={{()=>notify('수강 목록에 추가했습니다.')}}>{{SITE.action_label}}</button></div></article>)}}</section></>
}}

function FixturePanel({{ token, notify }}) {{
  const [value, setValue] = useState('')
  const [preview, setPreview] = useState('')
  const [note, setNote] = useState('')
  const [notes, setNotes] = useState([])
  const [slowDone, setSlowDone] = useState('')
  const [clientTotal, setClientTotal] = useState('1000')

  const searchPreview = async () => {{ const d=await api(`/echo?q=${{encodeURIComponent(value)}}`); setPreview(d.html) }}
  const saveNote = async () => {{ await api('/notes', {{method:'POST', body:JSON.stringify({{content:note}})}}, token); setNote(''); const d=await api('/notes', {{}}, token); setNotes(d.notes); notify('메모를 저장했습니다.') }}
  const slow = async () => {{ setSlowDone(''); await api('/slow-action', {{method:'POST',body:JSON.stringify({{label:'fixture'}})}}, token); setSlowDone('저장 완료') }}
  const checkout = async () => {{ const d=await api('/checkout', {{method:'POST', body:JSON.stringify({{clientTotal:Number(clientTotal)}})}}, token); notify(`승인 금액 ${{Number(d.approved_total).toLocaleString()}}`) }}

  if (![...BUG_FAMILIES].some(x=>['reflected-xss','stored-xss','async-no-feedback','price-tampering'].includes(x))) return null
  return <section className="fixture-panel">
    <div><p className="eyebrow">INTERACTION AREA</p><h3>일반 기능 입력 영역</h3><p className="muted">사이트 기능 속에 배치된 UI 재현형 오류를 테스트할 수 있습니다. API 전용 오류는 BUGS.md를 참고합니다.</p></div>
    {{BUG_FAMILIES.has('reflected-xss') && <div className="fixture-card"><b>검색/미리보기</b><div className="inline"><input value={{value}} onChange={{e=>setValue(e.target.value)}} placeholder="검색어"/><button onClick={{searchPreview}}>미리보기</button></div><div className="preview" dangerouslySetInnerHTML={{{{__html: preview}}}} /></div>}}
    {{BUG_FAMILIES.has('stored-xss') && <div className="fixture-card"><b>개인 메모</b><div className="inline"><input value={{note}} onChange={{e=>setNote(e.target.value)}} placeholder="메모 내용"/><button onClick={{saveNote}}>저장</button></div><div>{{notes.map(n=><div className="preview" key={{n.id}} dangerouslySetInnerHTML={{{{__html:n.content}}}} />)}}</div></div>}}
    {{BUG_FAMILIES.has('price-tampering') && <div className="fixture-card"><b>결제 확인</b><div className="inline"><input value={{clientTotal}} onChange={{e=>setClientTotal(e.target.value)}} inputMode="numeric"/><button onClick={{checkout}}>결제 요청</button></div></div>}}
    {{BUG_FAMILIES.has('async-no-feedback') && <div className="fixture-card"><b>비동기 저장</b><p className="muted">저장 버튼을 누르면 요청이 끝날 때까지 UI 변화가 없습니다.</p><button onClick={{slow}}>저장</button><span className="done">{{slowDone}}</span></div>}}
  </section>
}}

export default function App() {{
  const [auth, setAuth] = useState(null)
  const [items, setItems] = useState([])
  const [toast, setToast] = useState('')
  useEffect(()=>{{ if(auth) api('/items').then(d=>setItems(d.items)) }},[auth])
  const notify = (m) => {{ setToast(m); setTimeout(()=>setToast(''), 2200) }}
  if(!auth) return <Login onLogin={{setAuth}} />
  const props={{items,token:auth.token,notify}}
  return <div className={{`app ${{SITE.archetype.toLowerCase()}} ${{SITE.layout_variant}}`}}>
    <header><button className="brand" onClick={{()=>location.reload()}}><span>{{SITE.brand.slice(0,1)}}</span>{{SITE.brand}}</button><nav><a href="#main">홈</a><a href="#interaction">기능</a><a href="#account">계정</a></nav><div className="account"><span>{{auth.user.name}}</span><button onClick={{async()=>{{await api('/auth/logout',{{method:'POST'}},auth.token); setAuth(null)}}}}>로그아웃</button></div></header>
    <main id="main">
      {{SITE.archetype==='Commerce' && <CommerceView {{...props}} />}}
      {{SITE.archetype==='Booking' && <BookingView {{...props}} />}}
      {{SITE.archetype==='Community' && <CommunityView {{...props}} />}}
      {{SITE.archetype==='Dashboard' && <DashboardView {{...props}} />}}
      {{SITE.archetype==='Learning' && <LearningView {{...props}} />}}
      <div id="interaction"><FixturePanel token={{auth.token}} notify={{notify}} /></div>
      <section id="account" className="account-strip"><span>테스트 환경</span><b>{{SITE.site_id}}</b><span>{{SITE.dom_variant}}</span></section>
    </main>
    {{toast && <div className="toast">{{toast}}</div>}}
  </div>
}}
"""


def generate_css(site, config):
    accent=config['accent']; soft=config['soft']
    return f""":root {{ font-family: Inter, Pretendard, system-ui, sans-serif; color: #18212a; background: #f7f8f9; --accent:{accent}; --soft:{soft}; --line:#dfe3e7; --muted:#6b7280; }}
* {{ box-sizing:border-box }} body {{ margin:0; min-width:320px; background:#f7f8f9 }} button,input {{ font:inherit }} button {{ cursor:pointer }}
.app header {{ height:68px; padding:0 4vw; display:flex; align-items:center; border-bottom:1px solid var(--line); background:#fff; position:sticky; top:0; z-index:5 }}
.brand {{ border:0;background:none;font-weight:800;display:flex;align-items:center;gap:10px;font-size:13px }} .brand span,.brand-dot {{ width:30px;height:30px;border-radius:9px;background:var(--accent);color:#fff;display:grid;place-items:center;font-weight:900 }}
header nav {{ margin-left:50px;display:flex;gap:24px }} header nav a {{ color:var(--muted);text-decoration:none;font-size:12px }} .account {{ margin-left:auto;display:flex;align-items:center;gap:16px;font-size:11px }} .account button {{ border:0;background:none;color:var(--muted) }}
main {{ max-width:1240px;margin:auto;padding:0 4vw 90px }} .hero {{ min-height:320px;padding:72px 0 55px;display:flex;align-items:end;justify-content:space-between;border-bottom:1px solid var(--line) }} .hero.compact {{ min-height:220px }}
.eyebrow {{ color:var(--accent);font-size:10px;letter-spacing:1.6px;font-weight:800;margin:0 0 12px }} h1,h2,h3,p {{ margin-top:0 }} h1 {{ font-size:44px;line-height:1.05 }} h2 {{ font-size:clamp(38px,5vw,66px);line-height:1;margin-bottom:18px;letter-spacing:-2px }} h3 {{ margin-bottom:8px }} .muted,.hero p,.product-card p,.course p,.post p {{ color:var(--muted);font-size:12px;line-height:1.65 }}
.hero-stat,.hero-badge {{ text-align:right;background:var(--soft);padding:22px 26px;border-radius:18px }} .hero-stat b,.hero-badge b {{ font-size:30px;color:var(--accent);display:block }} .hero-stat span,.hero-badge {{ font-size:11px;color:var(--muted) }}
.cards {{ display:grid;grid-template-columns:repeat(3,1fr);gap:18px;padding-top:34px }} .product-card,.course {{ background:#fff;border:1px solid var(--line);border-radius:18px;overflow:hidden }} .visual {{ height:185px;background:var(--soft);display:grid;place-items:center;font-size:64px }} .product-card .row,.course .row {{ padding:18px;display:flex;justify-content:space-between;gap:12px }} .product-card button,.course button,.fixture-card button {{ border:1px solid var(--line);background:#fff;padding:10px 13px;border-radius:10px }} .product-card>button {{ margin:0 18px 18px;width:calc(100% - 36px) }}
.row strong {{ white-space:nowrap }} .mini-panel {{ position:fixed;right:24px;bottom:24px;background:#18212a;color:#fff;border-radius:16px;padding:14px 18px;display:flex;gap:18px;font-size:12px }}
.booking-layout {{ display:grid;grid-template-columns:1.4fr .7fr;gap:28px;padding-top:32px }} .booking-list {{ display:grid;gap:10px }} .stay-row {{ border:1px solid var(--line);background:#fff;border-radius:16px;padding:15px;display:grid;grid-template-columns:60px 1fr auto;align-items:center;text-align:left;gap:14px }} .stay-row.active {{ outline:2px solid var(--accent) }} .stay-emoji {{ font-size:35px }} .stay-row small {{ display:block;color:var(--muted);margin-top:4px }} .booking-detail,.topic-panel {{ background:#fff;border:1px solid var(--line);border-radius:18px;padding:24px;height:max-content;position:sticky;top:90px }}
.primary {{ border:0;background:var(--accent);color:#fff;padding:12px 16px;border-radius:11px;width:100% }} .primary.small {{ width:auto }} .search-box {{ display:flex;gap:15px;background:#fff;border:1px solid var(--line);padding:16px 20px;border-radius:14px;align-items:center;font-size:11px }}
.community-layout {{ display:grid;grid-template-columns:1fr 260px;gap:32px;padding-top:22px }} .feed {{ border-top:1px solid var(--line) }} .post {{ background:#fff;border-bottom:1px solid var(--line);padding:22px;display:grid;grid-template-columns:50px 1fr;gap:14px }} .avatar {{ width:44px;height:44px;border-radius:50%;background:var(--soft);display:grid;place-items:center;font-size:23px }} .post small,.post-meta {{ color:var(--muted);font-size:10px }} .topic-panel b {{ display:block;padding:10px 0;border-bottom:1px solid var(--line);font-size:12px }}
.dash-head {{ padding:60px 0 30px;display:flex;justify-content:space-between;align-items:end }} .metrics {{ display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:28px }} .metrics div {{ background:#fff;border:1px solid var(--line);padding:22px;border-radius:16px }} .metrics span {{ color:var(--muted);font-size:11px }} .metrics b {{ display:block;font-size:29px;margin-top:5px }} .project-table {{ background:#fff;border:1px solid var(--line);border-radius:18px;overflow:hidden }} .table-head,.project-row {{ display:grid;grid-template-columns:2fr 1fr .7fr;align-items:center;gap:18px;padding:15px 20px;border-bottom:1px solid var(--line) }} .table-head {{ font-size:10px;color:var(--muted);background:#fafafa }} .project-row>span:first-child {{ display:grid;grid-template-columns:34px 1fr;align-items:center }} .project-row small {{ grid-column:2;color:var(--muted);font-size:10px }} .project-row i {{ font-style:normal }} .progress {{ width:100px;height:6px;border-radius:10px;background:#edf0f2;display:inline-block;margin-right:8px;overflow:hidden }} .progress i {{ display:block;height:100%;background:var(--accent) }} .project-row em {{ font-style:normal;font-size:10px;background:var(--soft);color:var(--accent);padding:6px 8px;border-radius:9px }}
.course-grid {{ display:grid;grid-template-columns:repeat(3,1fr);gap:18px;padding-top:34px }} .course {{ padding-bottom:15px }} .course-cover {{ height:150px;background:var(--soft);padding:20px;display:flex;justify-content:space-between;align-items:start }} .course-cover span {{ font-size:54px;align-self:center }} .course-cover small {{ font-weight:900;color:var(--accent) }} .course>p,.course>h3 {{ margin-left:18px;margin-right:18px }}
.fixture-panel {{ margin-top:70px;padding:30px;border-top:2px solid #18212a;background:#fff;border-radius:18px }} .fixture-panel>div:first-child {{ max-width:620px }} .fixture-card {{ border-top:1px solid var(--line);padding:18px 0 }} .inline {{ display:flex;gap:8px;margin-top:10px }} .inline input {{ flex:1;border:1px solid var(--line);border-radius:10px;padding:10px }} .preview {{ margin-top:10px;background:var(--soft);min-height:34px;padding:10px;border-radius:9px;font-size:12px }} .done {{ margin-left:12px;font-size:11px;color:var(--accent) }}
.account-strip {{ margin-top:40px;border-top:1px solid var(--line);padding:18px 0;display:flex;gap:20px;color:var(--muted);font-size:10px }} .toast {{ position:fixed;right:24px;top:86px;background:#18212a;color:#fff;padding:12px 16px;border-radius:12px;font-size:11px;z-index:9 }}
.login-shell {{ min-height:100vh;display:grid;place-items:center;padding:30px;background:linear-gradient(135deg,var(--soft),#f8fafc) }} .login-card {{ width:min(480px,100%);background:#fff;border:1px solid var(--line);border-radius:24px;padding:42px;box-shadow:0 20px 70px #00000010 }} .login-card form {{ display:grid;gap:14px;margin-top:28px }} .login-card label {{ font-size:11px;color:var(--muted);display:grid;gap:7px }} .login-card input {{ border:1px solid var(--line);padding:12px;border-radius:10px }} .demo {{ margin-top:20px;padding-top:18px;border-top:1px solid var(--line);font-size:10px;line-height:1.8;color:var(--muted) }} .error {{ color:#b91c1c;font-size:11px }}
/* Layout/DOM variants from manifest */
.sidebar-table .project-table,.sidebar-table .booking-list {{ border-left:5px solid var(--accent) }} .split-detail .cards {{ grid-template-columns:1.3fr 1fr }} .tabs-list .cards,.tabs-list .course-grid {{ grid-template-columns:repeat(2,1fr) }} .dashboard-grid .cards,.dashboard-grid .course-grid {{ grid-template-columns:repeat(4,1fr) }} .search-filter-cards main {{ max-width:1320px }} .accordion-list .product-card:nth-child(even) .visual {{ height:130px }} .modal-workflow .fixture-panel {{ box-shadow:0 20px 60px #0001 }} .stepper-form .fixture-card {{ padding-left:26px;border-left:3px solid var(--accent) }} .kanban-panels .project-table {{ display:grid;grid-template-columns:repeat(2,1fr) }} .kanban-panels .table-head {{ display:none }} .kanban-panels .project-row {{ grid-template-columns:1fr;align-items:start }}
@media(max-width:780px) {{ header nav {{ display:none }} .account span {{ display:none }} main {{ padding:0 18px 60px }} .hero {{ min-height:250px;align-items:start;flex-direction:column;gap:22px }} .cards,.course-grid,.metrics {{ grid-template-columns:1fr 1fr }} .booking-layout,.community-layout {{ grid-template-columns:1fr }} .booking-detail,.topic-panel {{ position:static }} .table-head,.project-row {{ grid-template-columns:1.4fr .7fr }} .table-head span:last-child,.project-row>span:last-child {{ display:none }} .login-card {{ padding:28px }} }}
@media(max-width:520px) {{ .cards,.course-grid,.metrics {{ grid-template-columns:1fr }} .stay-row {{ grid-template-columns:48px 1fr }} .stay-row>strong {{ grid-column:2 }} }}
"""


def generate_index_css():
    return """html { scroll-behavior: smooth; } a, button { -webkit-tap-highlight-color: transparent; }"""


def generate_bug_catalog(site, bugs):
    return json.dumps(bugs, ensure_ascii=False, indent=2) + '\n'


def generate_bugs_md(site, config, bugs):
    lines = [f"# Intentional Bug Catalog — {site['site_id']}", "", f"- Theme: **{site['theme']}**", f"- Archetype: **{site['archetype']}**", f"- Layout / DOM: `{site['layout_variant']}` / `{site['dom_variant']}`", "", "각 항목의 `source_id`, oracle, evidence는 팀 제공 `security_error_reward_policy.csv`에서 가져왔고, endpoint/UI는 이 사이트 구조에 맞게 매핑했습니다.", ""]
    for b in bugs:
        lines += [
            f"## {b['bug_id']} — {b['vulnerability_family']}",
            "",
            f"- **Source ID:** `{b['source_id']}`",
            f"- **Source error name:** {b['source_error_name']}",
            f"- **Reproduction scope:** `{b['reproduction_scope']}`",
            f"- **Site trigger / endpoint:** `{b['trigger']}`",
            f"- **Safe fixture:** `{b['safe_fixture']}`",
            f"- **Expected normal behavior:** {b['expected_normal_behavior']}",
            f"- **Intentional buggy behavior:** {b['intentional_buggy_behavior']}",
            f"- **Oracle required:** {b['oracle_required']}",
            f"- **Evidence required:** `{b['evidence_required']}`",
            f"- **Original target action:** {b['source_target_action']}",
            f"- **Reference:** {b['source_reference']}",
            "",
        ]
    return '\n'.join(lines)


def generate_readme(site, config, bugs):
    family_list = ', '.join(f"`{b['vulnerability_family']}`" for b in bugs)
    return f"""# {site['site_id']} — {site['theme']}

React/Vite + Express + SQLite 기반의 **의도적 오류 테스트 사이트**입니다.  
기준 샘플 `RL_Error_Test_error-site-v1`의 실행/문서 전달 형식을 유지하면서, `{site['archetype']}` 계열의 UI/DOM과 기능 흐름으로 변형했습니다.

## 포함 오류

{family_list}

상세 재현 조건과 evidence는 [`BUGS.md`](BUGS.md), 구조화 데이터는 [`bug_catalog.json`](bug_catalog.json)을 참고하세요.

## 요구 환경

- Node.js 24 이상
- npm

Node.js 24의 내장 `node:sqlite`를 사용하므로 별도 SQLite 설치는 필요하지 않습니다.

## 실행 방법

터미널을 두 개 열고 각각 실행합니다.

### Backend

```bash
cd backend
npm install
npm run dev
```

- Backend: `http://localhost:3000`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

- Frontend: `http://localhost:5173`

## 테스트 계정

- 사용자 A: `userA@test.com` / `1234`
- 사용자 B: `userB@test.com` / `1234`
- 관리자: `admin@test.com` / `1234`

두 일반 사용자 계정은 IDOR 등 사용자 간 접근 제어 재현에 사용합니다.

## 데이터 초기화

1. Backend 서버를 종료합니다.
2. `backend/data/site.sqlite`를 삭제합니다.
3. Backend를 다시 실행합니다.

```bash
cd backend
npm run dev
```

DB와 기본 테스트 데이터가 자동 재생성됩니다.

## 주요 API

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/me`
- `GET /api/items`
- `GET|POST /api/cart`
- `GET /api/private-records/:id`
- `GET /api/admin/protected`
- `POST /api/admin/demote-self`
- `GET /api/admin/privileged`
- `GET /api/echo`
- `GET|POST /api/notes`
- `GET /api/search`
- `POST /api/parse`
- `GET /api/header-check`
- `POST /api/checkout`
- `POST /api/transactions`
- `POST /api/slow-action`

## safe_fixture / reward 처리

- `safe_fixture`는 각 오류의 `BUGS.md` / `bug_catalog.json`에 원본 CSV 값을 유지합니다.
- 테스트는 로컬 fixture 데이터와 테스트 계정 범위에서 수행합니다.
- **reward 기준은 사이트 코드에 구현하지 않습니다.** 팀 지시대로 RAWD 학습 쪽에서 처리합니다.

## 문서 전달 체크

- [x] 실행 방법
- [x] 테스트 계정
- [x] 데이터 초기화 방법
- [x] API 전용 / UI 재현 범위 구분
- [x] 정상 동작 / 의도적 오류 동작
- [x] oracle / evidence
"""


def generate_site(site):
    config = site_data(site)
    bugs = bug_runtime(site)
    out = OUT / 'generated' / site['site_id']
    if out.exists(): shutil.rmtree(out)
    (out / 'backend').mkdir(parents=True)
    (out / 'frontend' / 'src').mkdir(parents=True)
    (out / 'frontend' / 'public').mkdir(parents=True)

    # Backend package metadata / lock from v1
    shutil.copy(V1 / 'backend' / 'package-lock.json', out / 'backend' / 'package-lock.json')
    shutil.copy(V1 / 'backend' / 'package.json', out / 'backend' / 'package.json')
    (out / 'backend' / 'server.js').write_text(generate_server(site, config, bugs), encoding='utf-8')

    # Frontend boilerplate from v1, custom app/css
    for name in ['package.json','package-lock.json','vite.config.js','eslint.config.js','index.html']:
        shutil.copy(V1 / 'frontend' / name, out / 'frontend' / name)
    (out / 'frontend' / 'src' / 'main.jsx').write_text("""import { StrictMode } from 'react'\nimport { createRoot } from 'react-dom/client'\nimport './index.css'\nimport App from './App.jsx'\n\ncreateRoot(document.getElementById('root')).render(<StrictMode><App /></StrictMode>)\n""", encoding='utf-8')
    (out / 'frontend' / 'src' / 'App.jsx').write_text(generate_app(site, config, bugs), encoding='utf-8')
    (out / 'frontend' / 'src' / 'App.css').write_text(generate_css(site, config), encoding='utf-8')
    (out / 'frontend' / 'src' / 'index.css').write_text(generate_index_css(), encoding='utf-8')

    (out / 'README.md').write_text(generate_readme(site, config, bugs), encoding='utf-8')
    (out / 'BUGS.md').write_text(generate_bugs_md(site, config, bugs), encoding='utf-8')
    (out / 'bug_catalog.json').write_text(generate_bug_catalog(site, bugs), encoding='utf-8')
    (out / '.gitignore').write_text("node_modules/\nbackend/data/*.sqlite\nfrontend/dist/\n.DS_Store\n", encoding='utf-8')
    (out / 'site_meta.json').write_text(json.dumps({**config, 'features': site['features'], 'bug_count': len(bugs)}, ensure_ascii=False, indent=2), encoding='utf-8')
    return out

if __name__ == '__main__':
    import argparse

    parser = argparse.ArgumentParser(description='Generate RL error training sites from sites_manifest_v1.json')
    parser.add_argument('--site', action='append', help='Specific site id to generate. Can be repeated.')
    parser.add_argument('--all', action='store_true', help='Generate all 50 sites from the manifest.')
    parser.add_argument('--representatives', action='store_true', help='Generate one representative from each archetype.')
    args = parser.parse_args()

    site_map = {s['site_id']: s for s in manifest['sites']}
    representatives = ['error-site-v02','error-site-v12','error-site-v22','error-site-v32','error-site-v42']

    if args.all:
        selected = [s['site_id'] for s in manifest['sites']]
    elif args.site:
        selected = args.site
    else:
        selected = representatives

    missing = [sid for sid in selected if sid not in site_map]
    if missing:
        raise SystemExit(f'Unknown site id(s): {missing}')

    for sid in selected:
        path = generate_site(site_map[sid])
        print(f'generated {sid}: {path}')
