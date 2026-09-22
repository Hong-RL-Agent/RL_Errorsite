import { useEffect, useMemo, useState } from 'react'
import './App.css'

const SITE = {"site_id": "error-site-v45", "theme": "코딩 튜토리얼", "archetype": "Learning", "brand": "Classroom 27 · 코딩 튜토리얼", "tagline": "짧게 배우고 바로 실습하는 온라인 강의 플랫폼", "resource_label": "강의", "action_label": "수강 시작", "layout_variant": "tabs-list", "dom_variant": "tabbed-list"}
const BUG_FAMILIES = new Set(["vertical-privilege-escalation", "permission-drift", "reflected-xss", "sql-injection", "session-fixation", "logout-reuse", "security-headers", "idempotency"])
const API = 'http://localhost:3000/api'

async function api(path, options = {}, token, extraHeaders = {}) {
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...extraHeaders,
      ...(options.headers ?? {}),
    },
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw Object.assign(new Error(data.message ?? '요청 실패'), { status: response.status, data })
  return data
}

const won = (n) => SITE.archetype === 'Community' || SITE.archetype === 'Dashboard' ? `${n}` : `${Number(n).toLocaleString('ko-KR')}원`

function Login({ onLogin }) {
  const [email, setEmail] = useState('userA@test.com')
  const [password, setPassword] = useState('1234')
  const [error, setError] = useState('')
  const submit = async (e) => {
    e.preventDefault(); setError('')
    try {
      const data = await api('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
      onLogin(data)
    } catch (err) { setError(err.message) }
  }
  return <main className="login-shell">
    <section className="login-card">
      <div className="brand-dot">{SITE.brand.slice(0,1)}</div>
      <p className="eyebrow">{SITE.site_id} · {SITE.archetype}</p>
      <h1>{SITE.brand}</h1>
      <p className="muted">{SITE.tagline}</p>
      <form onSubmit={submit}>
        <label>이메일<input value={email} onChange={e=>setEmail(e.target.value)} /></label>
        <label>비밀번호<input type="password" value={password} onChange={e=>setPassword(e.target.value)} /></label>
        {error && <p className="error">{error}</p>}
        <button className="primary">로그인</button>
      </form>
      <div className="demo"><b>테스트 계정</b><br/>userA@test.com / 1234<br/>userB@test.com / 1234<br/>admin@test.com / 1234</div>
    </section>
  </main>
}

function CommerceView({ items, token, notify }) {
  const [cart, setCart] = useState([])
  const add = async (id) => { await api('/cart', {method:'POST', body:JSON.stringify({itemId:id})}, token); notify('장바구니에 추가했습니다.'); refresh() }
  const refresh = async () => setCart((await api('/cart', {}, token)).items)
  useEffect(()=>{refresh()}, [])
  return <>
    <section className="hero commerce-hero"><div><p className="eyebrow">CURATED STATIONERY</p><h2>{SITE.theme}</h2><p>{SITE.tagline}</p></div><div className="hero-stat"><b>{items.length}</b><span>오늘의 셀렉션</span></div></section>
    <section className="cards commerce-grid">{items.map(item => <article className="product-card" key={item.id}><div className="visual">{item.emoji}</div><div className="row"><div><h3>{item.title}</h3><p>{item.description}</p></div><strong>{won(item.amount)}</strong></div><button onClick={()=>add(item.id)}>{SITE.action_label}</button></article>)}</section>
    <aside className="mini-panel"><span>장바구니</span><b>{cart.reduce((n,x)=>n+x.quantity,0)}개</b></aside>
  </>
}

function BookingView({ items, token, notify }) {
  const [selected, setSelected] = useState(items[0]?.id)
  return <>
    <section className="hero booking-hero"><div><p className="eyebrow">FIND YOUR STAY</p><h2>{SITE.theme}</h2><p>{SITE.tagline}</p></div><div className="search-box"><span>체크인</span><b>10. 04</b><span>2명</span></div></section>
    <div className="booking-layout"><div className="booking-list">{items.map(item => <button className={selected===item.id?'stay-row active':'stay-row'} onClick={()=>setSelected(item.id)} key={item.id}><span className="stay-emoji">{item.emoji}</span><span><b>{item.title}</b><small>{item.description}</small></span><strong>{won(item.amount)}</strong></button>)}</div><aside className="booking-detail"><p className="eyebrow">RESERVATION</p><h3>{items.find(x=>x.id===selected)?.title}</h3><p>무료 취소 · 체크인 15:00</p><button className="primary" onClick={()=>notify('예약 요청을 준비했습니다.')}>{SITE.action_label}</button></aside></div>
  </>
}

function CommunityView({ items }) {
  return <div className="community-layout"><section><div className="hero compact"><div><p className="eyebrow">TODAY'S LOOP</p><h2>{SITE.theme}</h2><p>{SITE.tagline}</p></div></div><div className="feed">{items.map(item=><article className="post" key={item.id}><div className="avatar">{item.emoji}</div><div><small>@member{item.id}</small><h3>{item.title}</h3><p>{item.description}</p><div className="post-meta">좋아요 {item.amount} · 댓글 {item.id+2}</div></div></article>)}</div></section><aside className="topic-panel"><p className="eyebrow">TOPICS</p><b>#주말취미</b><b>#기록</b><b>#초보환영</b><b>#모임후기</b></aside></div>
}

function DashboardView({ items }) {
  return <><section className="dash-head"><div><p className="eyebrow">WORKSPACE</p><h2>{SITE.theme}</h2><p>{SITE.tagline}</p></div><button className="primary small">새 작업</button></section><div className="metrics"><div><span>진행 프로젝트</span><b>6</b></div><div><span>이번 주 완료</span><b>14</b></div><div><span>지연</span><b>2</b></div></div><section className="project-table"><div className="table-head"><span>프로젝트</span><span>진행률</span><span>상태</span></div>{items.map(item=><div className="project-row" key={item.id}><span><i>{item.emoji}</i><b>{item.title}</b><small>{item.description}</small></span><span><div className="progress"><i style={{width:`${item.amount}%`}}></i></div>{item.amount}%</span><span><em>{item.amount>70?'안정':'진행 중'}</em></span></div>)}</section></>
}

function LearningView({ items, notify }) {
  return <><section className="hero learning-hero"><div><p className="eyebrow">LEARN · BUILD · REPEAT</p><h2>{SITE.theme}</h2><p>{SITE.tagline}</p></div><div className="hero-badge">이번 주<br/><b>3강</b></div></section><section className="course-grid">{items.map((item,idx)=><article className="course" key={item.id}><div className="course-cover"><span>{item.emoji}</span><small>0{idx+1}</small></div><p className="eyebrow">COURSE</p><h3>{item.title}</h3><p>{item.description}</p><div className="row"><strong>{won(item.amount)}</strong><button onClick={()=>notify('수강 목록에 추가했습니다.')}>{SITE.action_label}</button></div></article>)}</section></>
}

function FixturePanel({ token, notify }) {
  const [value, setValue] = useState('')
  const [preview, setPreview] = useState('')
  const [note, setNote] = useState('')
  const [notes, setNotes] = useState([])
  const [slowDone, setSlowDone] = useState('')
  const [clientTotal, setClientTotal] = useState('1000')

  const searchPreview = async () => { const d=await api(`/echo?q=${encodeURIComponent(value)}`); setPreview(d.html) }
  const saveNote = async () => { await api('/notes', {method:'POST', body:JSON.stringify({content:note})}, token); setNote(''); const d=await api('/notes', {}, token); setNotes(d.notes); notify('메모를 저장했습니다.') }
  const slow = async () => { setSlowDone(''); await api('/slow-action', {method:'POST',body:JSON.stringify({label:'fixture'})}, token); setSlowDone('저장 완료') }
  const checkout = async () => { const d=await api('/checkout', {method:'POST', body:JSON.stringify({clientTotal:Number(clientTotal)})}, token); notify(`승인 금액 ${Number(d.approved_total).toLocaleString()}`) }

  if (![...BUG_FAMILIES].some(x=>['reflected-xss','stored-xss','async-no-feedback','price-tampering'].includes(x))) return null
  return <section className="fixture-panel">
    <div><p className="eyebrow">INTERACTION AREA</p><h3>일반 기능 입력 영역</h3><p className="muted">사이트 기능 속에 배치된 UI 재현형 오류를 테스트할 수 있습니다. API 전용 오류는 BUGS.md를 참고합니다.</p></div>
    {BUG_FAMILIES.has('reflected-xss') && <div className="fixture-card"><b>검색/미리보기</b><div className="inline"><input value={value} onChange={e=>setValue(e.target.value)} placeholder="검색어"/><button onClick={searchPreview}>미리보기</button></div><div className="preview" dangerouslySetInnerHTML={{__html: preview}} /></div>}
    {BUG_FAMILIES.has('stored-xss') && <div className="fixture-card"><b>개인 메모</b><div className="inline"><input value={note} onChange={e=>setNote(e.target.value)} placeholder="메모 내용"/><button onClick={saveNote}>저장</button></div><div>{notes.map(n=><div className="preview" key={n.id} dangerouslySetInnerHTML={{__html:n.content}} />)}</div></div>}
    {BUG_FAMILIES.has('price-tampering') && <div className="fixture-card"><b>결제 확인</b><div className="inline"><input value={clientTotal} onChange={e=>setClientTotal(e.target.value)} inputMode="numeric"/><button onClick={checkout}>결제 요청</button></div></div>}
    {BUG_FAMILIES.has('async-no-feedback') && <div className="fixture-card"><b>비동기 저장</b><p className="muted">저장 버튼을 누르면 요청이 끝날 때까지 UI 변화가 없습니다.</p><button onClick={slow}>저장</button><span className="done">{slowDone}</span></div>}
  </section>
}

export default function App() {
  const [auth, setAuth] = useState(null)
  const [items, setItems] = useState([])
  const [toast, setToast] = useState('')
  useEffect(()=>{ if(auth) api('/items').then(d=>setItems(d.items)) },[auth])
  const notify = (m) => { setToast(m); setTimeout(()=>setToast(''), 2200) }
  if(!auth) return <Login onLogin={setAuth} />
  const props={items,token:auth.token,notify}
  return <div className={`app ${SITE.archetype.toLowerCase()} ${SITE.layout_variant}`}>
    <header><button className="brand" onClick={()=>location.reload()}><span>{SITE.brand.slice(0,1)}</span>{SITE.brand}</button><nav><a href="#main">홈</a><a href="#interaction">기능</a><a href="#account">계정</a></nav><div className="account"><span>{auth.user.name}</span><button onClick={async()=>{await api('/auth/logout',{method:'POST'},auth.token); setAuth(null)}}>로그아웃</button></div></header>
    <main id="main">
      {SITE.archetype==='Commerce' && <CommerceView {...props} />}
      {SITE.archetype==='Booking' && <BookingView {...props} />}
      {SITE.archetype==='Community' && <CommunityView {...props} />}
      {SITE.archetype==='Dashboard' && <DashboardView {...props} />}
      {SITE.archetype==='Learning' && <LearningView {...props} />}
      <div id="interaction"><FixturePanel token={auth.token} notify={notify} /></div>
      <section id="account" className="account-strip"><span>테스트 환경</span><b>{SITE.site_id}</b><span>{SITE.dom_variant}</span></section>
    </main>
    {toast && <div className="toast">{toast}</div>}
  </div>
}
