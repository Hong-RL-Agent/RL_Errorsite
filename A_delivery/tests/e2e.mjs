import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawn,spawnSync} from 'node:child_process';
import {chromium} from 'playwright';
import {sites} from '../shared/sites.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const args=process.argv.slice(2),split=args[args.indexOf('--split')+1]||'training';
const requested=args.filter(x=>sites[x]);
const ids=requested.length?requested:Object.keys(sites).filter(id=>split==='all'||sites[id].split===split);
if(!ids.length)throw new Error('No sites selected');
const out=path.join(root,'test-results'),results=[];await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true,channel:process.env.BROWSER_CHANNEL||'msedge'});
const children=[];
async function stop(){for(const c of children.splice(0)){if(process.platform==='win32')spawnSync('taskkill',['/PID',String(c.pid),'/T','/F'],{stdio:'ignore'});else c.kill('SIGTERM');}}
async function start(id){const cfg=sites[id],logs=path.join(root,'logs');await fs.mkdir(logs,{recursive:true});const api=spawn(process.execPath,[path.join(root,'backend/server.mjs'),id],{cwd:root,env:process.env});const bin=cfg.kind==='next'?'next/dist/bin/next':'vite/bin/vite.js';const front=spawn(process.execPath,[path.join(root,'node_modules',bin),...(cfg.kind==='next'?['dev','--hostname','127.0.0.1','--port',String(cfg.port)]:['--host','127.0.0.1','--port',String(cfg.port),'--strictPort'])],{cwd:path.join(root,id),env:{...process.env,NEXT_TELEMETRY_DISABLED:'1'}});for(const [c,name] of [[api,'api'],[front,'frontend']]){children.push(c);c.stdout.on('data',b=>fs.appendFile(path.join(logs,`${id}-${name}.log`),b));c.stderr.on('data',b=>fs.appendFile(path.join(logs,`${id}-${name}.log`),b));}const deadline=Date.now()+120000;while(Date.now()<deadline){try{const r=await fetch(`http://127.0.0.1:${cfg.port}/api/health`);if(r.ok){const h=await r.json();assert.equal(h.site,id);return;}}catch{}if(api.exitCode!==null||front.exitCode!==null)throw new Error(`${id} process exited; see logs`);await new Promise(r=>setTimeout(r,500));}throw new Error(`${id} startup timeout`);}
const cases={
'A-01':[
async t=>{await t.click('체크 노트 담기','items');assert.equal((await t.state()).cart.find(x=>x.id===1).qty,2);await t.text('체크 노트', 'article');await t.text('담긴 수량: 4');},
async t=>{await t.click('젤펜 세트 빼기','items');assert((await t.state()).cart.some(x=>x.id===2));await t.text('젤펜 세트 빼기');},
async t=>{await t.fill('위클리 플래너 수량','0','quantity');assert.equal((await t.state()).cart.find(x=>x.id===3).qty,0);assert.equal(await t.page.getByLabel('위클리 플래너 수량',{exact:true}).inputValue(),'0');},
async t=>{await t.click('점착 메모 찜','collection');assert.deepEqual((await t.state()).saved,[5]);await t.text('보관 목록: 펜슬 파우치');}],
'A-02':[
async t=>{await t.fill('소식 제목','회의 안내');await t.fill('소식 본문','내일 회의');await t.click('소식 올리기','publish');assert.equal((await t.state()).posts.filter(x=>x.title==='회의 안내').length,2);assert.equal(await t.page.getByRole('heading',{name:'회의 안내',exact:true}).count(),2);},
async t=>{await t.click('분실물 안내 지우기','remove');assert((await t.state()).posts.some(x=>x.id===2));await t.text('분실물 안내');},
async t=>{await t.fill('독서 모임 수정 내용','변경');await t.click('독서 모임 고치기','revise');const s=await t.state();assert.equal(s.posts.find(x=>x.id===3).content,'금요일 저녁 모임입니다.');assert.equal(s.posts.find(x=>x.id===4).content,'변경');const article=t.page.locator('article').filter({has:t.page.getByRole('heading',{name:'운동 친구',exact:true})});assert.equal(await article.locator('.content').textContent(),'변경');},
async t=>{await t.click('주말 장터 공감 0','applaud');assert.equal((await t.state()).posts[0].likes,2);await t.text('주말 장터 공감 2');}],
'A-03':[
async t=>{await t.click('파이썬 기초 수강하기','join');assert(!(await t.state()).enrolled.includes(1));assert.equal(await t.page.locator('section.panel li').filter({hasText:'파이썬 기초'}).count(),0);},
async t=>{await t.click('사진 입문 취소','withdraw');assert((await t.state()).enrolled.includes(2));await t.text('사진 입문','section.panel');},
async t=>{await t.click('드로잉 시작 수강하기','join');assert.equal((await t.state()).enrolled.filter(x=>x===3).length,2);assert.equal(await t.page.locator('section.panel li').filter({hasText:'드로잉 시작'}).count(),2);},
async t=>{await t.click('웹 개발 수강하기','join');await t.text('웹 개발','section.panel');assert(!(await t.state()).enrolled.includes(4));await t.click('신청 내역 조회','');assert.equal(await t.page.locator('section.panel li').filter({hasText:'웹 개발'}).count(),0);}],
'A-04':[
async t=>{await t.click('후라이드 치킨 주문표에 추가','dish');assert.equal((await t.state()).order.find(x=>x.id===1).qty,2);await t.text('2인분');},
async t=>{await t.click('짜장면 제외','clear-dish');assert((await t.state()).order.some(x=>x.id===2));await t.text('짜장면 제외');},
async t=>{await t.fill('쿠폰 코드','TAKE20');await t.click('할인 적용','voucher');assert.equal((await t.state()).total,7200);await t.text('결제 금액 7,200원');},
async t=>{await t.click('비빔밥 주문표에 추가','dish');await t.click('주방으로 보내기','send');assert(!(await t.state()).receipt.some(x=>x.id===3));assert((await t.state()).receipt.some(x=>x.id===4));await t.text('김치찌개 1인분','section');}],
'A-05':[
async t=>{await t.select('숙박일','2');await t.click('객실 찾기','dates');await t.click('옵션 확인','options');await t.click('예상 금액 보기','review');assert.equal((await t.state()).flow.quote,50000);await t.text('예약 예상액 50,000원');},
async t=>{await t.click('객실 찾기','dates');await t.select('객실','deluxe');await t.check('조식 포함',true);await t.click('옵션 확인','options');await t.click('옵션 다시 선택','back');await t.check('조식 포함',false);await t.click('옵션 확인','options');await t.click('예상 금액 보기','review');const s=await t.state();assert.equal(s.flow.breakfast,true);assert.equal(s.flow.quote,90000);await t.text('예약 예상액 90,000원');},
async t=>{await t.stay('suite');await t.click('결제하고 확정','pay');assert.equal((await t.state()).charged,120000);assert.equal((await t.state()).reservations.length,0);await t.text('결제 기록 120,000원');await t.text('객실 확정에 실패했습니다.');},
async t=>{await t.stay('garden');await t.click('결제하고 확정','pay');await t.click('예약 철회','cancel');const s=await t.state();assert.equal(s.availability.garden,2);assert.equal(s.charged,0);await t.text('가든 남은 객실 2');}],
'A-06':[
async t=>{await t.journey('제주','배');await t.click('일정 확정하기','commit');await t.click('일정 취소하기','undo');assert.equal((await t.state()).capacity,3);await t.text('잔여 이동권 3');},
async t=>{await t.journey('부산');await t.click('일정 확정하기','commit');await t.click('일정 취소하기','undo');await t.click('여행 노트 공개','share');assert.equal((await t.state()).route[0].status,'published');await t.text('부산 · 기차 · published');},
async t=>{await t.journey('강릉');await t.click('경로 편집으로','return');await t.click('경로 미리보기','draft');assert.equal((await t.state()).stage,'planning');await t.text('현재 진행: planning');},
async t=>{await t.journey('서울');await t.click('일정 확정하기','commit');await t.click('일정 취소하기','undo');assert.equal((await t.state()).balance,80000);await t.text('여행 지갑 80,000원');}],
'A-07':[
async t=>{await t.profile('표시 이름','이하늘','identity','displayName');await t.reload();assert.equal((await t.state()).profile.displayName,'김하늘');await t.text('표시 이름: 김하늘');},
async t=>{await t.profile('자기소개','산책을 좋아합니다','introduction','bio');await t.clickLink('계정 다시 방문');assert.equal((await t.state()).profile.bio,'여행과 독서를 좋아합니다.');await t.text('자기소개: 여행과 독서를 좋아합니다.');},
async t=>{await t.profile('사용 언어','English','language','locale');await t.reload();assert.equal((await t.state()).profile.locale,'한국어');await t.text('사용 언어: 한국어');},
async t=>{await t.check('소식 수신',true);await t.click('소식 수신 저장','notifications');await t.text('소식 수신: 수신');await t.reload();assert.equal((await t.state()).profile.newsletter,false);await t.text('소식 수신: 미수신');}],
'A-08':[
async t=>{await t.click('달빛 서재 빌리기','checkout');assert.equal((await t.state()).loans.filter(x=>x.id===1).length,2);assert.equal(await t.page.getByRole('button',{name:'달빛 서재 반납',exact:true}).count(),2);},
async t=>{await t.click('마음의 정원 반납','checkin');assert.equal((await t.state()).fee,1000);assert(!(await t.state()).loans.some(x=>x.id===2));await t.text('미반납 도서 연체료 1,000원');},
async t=>{await t.fill('저자','박지현');await t.click('저자로 찾기','author');await t.select('출판 연도','2024');await t.click('연도 좁히기','edition');const s=await t.state();assert.equal(s.matches.length,2);assert(s.matches.every(x=>x.author!=='박지현'));await t.text('달빛 서재 / 이수아 / 2024','.search-results');},
async t=>{await t.click('우주의 시간 연장','renew');await t.text('우주의 시간 · 기한 2026-11-01');await t.reload();assert.equal((await t.state()).loans.find(x=>x.id===3).due,'2026-10-25');await t.text('우주의 시간 · 기한 2026-10-25');}],
'A-09':[
async t=>{await t.click('좌석 B1','seat');assert.equal((await t.state()).seats[0].selected,false);assert.equal(await t.page.getByRole('button',{name:'좌석 B1',exact:true}).getAttribute('aria-pressed'),'false');},
async t=>{await t.select('패스','페어');await t.click('패스 선택 완료','party');await t.click('청구서 확인','extras');assert.equal((await t.state()).invoice,50000);await t.text('청구액 50,000원');},
async t=>{await t.click('좌석 B3','seat');await t.click('입장권 발급','issue');await t.click('발급 취소','release');assert.equal((await t.state()).capacity,3);await t.text('배정 가능 좌석 3');},
async t=>{await t.select('수령 방식','현장');await t.click('수령 방식 등록','delivery');await t.text('등록된 수령 방식 현장');await t.reload();assert.equal((await t.state()).preference,'모바일');await t.text('등록된 수령 방식 모바일');}],
'A-10':[
async t=>{await t.click('동행 한 명 추가','party-size');assert.equal((await t.state()).qty,3);await t.text('관람 인원 3명');},
async t=>{await t.fill('공연일','2026-10-20');await t.click('해당 날짜 회차 찾기','calendar');await t.select('회차','낮');await t.click('관람 회차 결정','showtime');await t.click('관람 예약 접수','hold');assert.equal((await t.state()).reservation.day,'2026-10-21');await t.text('접수 내역 2026-10-21 낮 held');},
async t=>{await t.fill('받는 분','민수');await t.click('초대장 발송','invite');await t.click('초대장 회수','revoke');assert.equal((await t.state()).balance,110000);await t.text('예매 지갑 110,000원');},
async t=>{await t.fill('관람 지원 요청','휠체어 동선 안내');await t.click('지원 요청 남기기','access');await t.text('등록된 요청 휠체어 동선 안내');await t.reload();assert.equal((await t.state()).note,'계단 이용 가능');await t.text('등록된 요청 계단 이용 가능');}]
};
const healthy={
'A-01':async t=>{await t.click('펜슬 파우치 담기','items');assert.equal((await t.state()).cart.find(x=>x.id===5).qty,1);await t.reload();assert.equal((await t.state()).cart.find(x=>x.id===5).qty,1);await t.click('펜슬 파우치 빼기','items');assert(!(await t.state()).cart.some(x=>x.id===5));},
'A-02':async t=>{await t.fill('소식 제목','정상 소식');await t.fill('소식 본문','내용');await t.click('소식 올리기','publish');assert.equal((await t.state()).posts.filter(x=>x.title==='정상 소식').length,1);await t.reload();await t.text('정상 소식');await t.click('정상 소식 지우기','remove');assert(!(await t.state()).posts.some(x=>x.title==='정상 소식'));},
'A-03':async t=>{await t.click('생활 영어 수강하기','join');await t.reload();assert((await t.state()).enrolled.includes(5));await t.click('생활 영어 취소','withdraw');assert(!(await t.state()).enrolled.includes(5));},
'A-04':async t=>{await t.click('샌드위치 주문표에 추가','dish');await t.fill('쿠폰 코드','SAVE10');await t.click('할인 적용','voucher');assert.equal((await t.state()).total,11700);await t.reload();await t.click('주방으로 보내기','send');assert((await t.state()).receipt.some(x=>x.id===5));},
'A-05':async t=>{await t.stay('standard');await t.click('결제하고 확정','pay');assert.equal((await t.state()).charged,50000);await t.reload();await t.click('예약 철회','cancel');assert.equal((await t.state()).availability.standard,3);assert.equal((await t.state()).charged,0);},
'A-06':async t=>{await t.journey('대전');await t.click('일정 확정하기','commit');await t.reload();await t.click('일정 취소하기','undo');assert.equal((await t.state()).capacity,4);assert.equal((await t.state()).balance,100000);},
'A-07':async t=>{await t.fill('연락처','010-9876-5432');await t.click('연락처 저장','contact');await t.reload();assert.equal((await t.state()).profile.phone,'010-9876-5432');await t.text('연락처: 010-9876-5432');},
'A-08':async t=>{await t.click('파이썬으로 배우는 AI 빌리기','checkout');await t.click('파이썬으로 배우는 AI 연장','renew');await t.reload();assert.equal((await t.state()).loans.find(x=>x.id===4).due,'2026-11-01');await t.click('파이썬으로 배우는 AI 반납','checkin');assert(!(await t.state()).loans.some(x=>x.id===4));},
'A-09':async t=>{await t.click('좌석 B2','seat');await t.click('입장권 발급','issue');await t.reload();await t.click('발급 취소','release');assert.equal((await t.state()).capacity,4);},
'A-10':async t=>{await t.click('해당 날짜 회차 찾기','calendar');await t.select('회차','저녁');await t.click('관람 회차 결정','showtime');await t.click('관람 예약 접수','hold');await t.reload();assert.equal((await t.state()).reservation.day,'2026-10-20');await t.text('접수 내역 2026-10-20 저녁 held');}
};
async function makeTools(id,page,actions){const cfg=sites[id],url=`http://127.0.0.1:${cfg.port}`,api=`http://127.0.0.1:${cfg.api}`;
  const settle=()=>page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  const act=async(description,fn,op)=>{actions.push({order:actions.length+1,description});if(op!==undefined){const response=page.waitForResponse(r=>r.url().endsWith(cfg.path+(op?'/'+op:''))&&r.request().resourceType()==='fetch');await fn();await(await response).finished();}else await fn();await settle();};
  const t={page,state:async()=>{const r=await fetch(api+'/api/test/state');return r.json();},click:(name,op)=>act('click '+name,()=>page.getByRole('button',{name,exact:true}).click(),op),fill:(label,value,op)=>act('fill '+label+'='+value,()=>page.getByLabel(label,{exact:true}).fill(value),op),select:(label,value)=>act('select '+label+'='+value,()=>page.getByLabel(label,{exact:true}).selectOption(value)),check:(label,value)=>act('check '+label+'='+value,()=>page.getByLabel(label,{exact:true}).setChecked(value)),text:async(value,selector='body')=>{const text=await page.locator(selector).allTextContents();assert(text.join('\n').includes(value),`UI missing: ${value}`);},reload:async()=>{actions.push({description:'reload'});await page.reload();await page.getByRole('heading',{name:cfg.name,exact:true}).waitFor();await page.locator('main').getByRole('button').first().waitFor();await page.waitForResponse(r=>r.url().endsWith(cfg.path)).catch(()=>{});await settle();},clickLink:async(name)=>{actions.push({description:'revisit '+name});const response=page.waitForResponse(r=>r.url().endsWith(cfg.path));await page.getByRole('link',{name,exact:true}).click();await(await response).finished();await settle();}};
  // Attach the response wait before navigation, including very fast local API responses.
  t.reload=async()=>{actions.push({description:'reload'});const r=page.waitForResponse(r=>r.url().endsWith(cfg.path));await page.reload();await(await r).finished();await settle();};
  t.stay=async room=>{await t.click('객실 찾기','dates');await t.select('객실',room);await t.click('옵션 확인','options');await t.click('예상 금액 보기','review');};
  t.journey=async(city,transport='기차')=>{await t.select('여행지',city);await t.select('이동 수단',transport);await t.click('여행 계획 시작','destination');await t.click('경로 미리보기','draft');};
  t.profile=async(label,value,op)=>{await t.fill(label,value);await t.click(label+' 저장',op);await t.text(label+': '+value);};
  t.open=async()=>{const r=page.waitForResponse(r=>r.url().endsWith(cfg.path));await page.goto(url);await(await r).finished();await settle();};
  t.reset=async()=>{await fetch(api+'/api/test/reset',{method:'POST'});await t.open();};
  return t;
}
try{
 for(const id of ids){console.log('Testing',id);await start(id);const cfg=sites[id],catalog=JSON.parse(await fs.readFile(path.join(root,id,'bug_catalog.json'),'utf8'));const context=await browser.newContext({viewport:{width:1280,height:900}});const page=await context.newPage();page.setDefaultTimeout(12000);
 for(let n=0;n<4;n++){
  const bug=catalog.bugs[n],directory=path.join(out,cfg.split,bug.bug_id);await fs.mkdir(directory,{recursive:true});const rounds=[];
  for(let round=1;round<=2;round++){const actions=[],network=[],errors=[];const onResponse=async r=>{if(r.url().includes('/api/')&&!r.url().includes('/api/test/')){try{network.push({url:r.url(),method:r.request().method(),request:r.request().postDataJSON(),status:r.status(),response:await r.json()});}catch{}}};const onError=e=>errors.push(e.message);page.on('response',onResponse);page.on('pageerror',onError);const t=await makeTools(id,page,actions);let initial,final;
  try{await t.reset();initial=await t.state();await cases[id][n](t);final=await t.state();assert.equal(errors.length,0,errors.join('\n'));assert(network.length>=2,'Missing network evidence');const text=await page.locator('body').innerText();await page.screenshot({path:path.join(directory,`round-${round}.png`),fullPage:true});await fs.writeFile(path.join(directory,`round-${round}.html`),await page.content());const events=await(await fetch(`http://127.0.0.1:${cfg.api}/api/test/events`)).json();rounds.push({round,pass:true,initial,final,actions,network,events,UI:text,expected:bug.expected,actual:bug.actual,Evidence:bug.evidence});console.log('PASS',bug.bug_id,'round',round);}catch(e){rounds.push({round,pass:false,error:e.stack,actions,network,initial,final});console.error('FAIL',bug.bug_id,e.message);await page.screenshot({path:path.join(directory,`failure-${round}.png`),fullPage:true}).catch(()=>{});}finally{page.off('response',onResponse);page.off('pageerror',onError);}}
  if(rounds.every(r=>r.pass)){assert.deepEqual(rounds[0].initial,rounds[1].initial,'Reset precondition drift');assert.deepEqual(rounds[0].final,rounds[1].final,'Non-deterministic state');}
  await fs.writeFile(path.join(directory,'evidence.json'),JSON.stringify({bug,rounds},null,2));results.push({site:id,bug:bug.bug_id,pass:rounds.every(x=>x.pass)});
 }
 const t=await makeTools(id,page,[]);try{await t.reset();await healthy[id](t);console.log('PASS',id,'healthy persistent flow');results.push({site:id,check:'healthy-persistence',pass:true});const eventsBefore=await(await fetch(`http://127.0.0.1:${cfg.api}/api/test/events`)).json();assert(eventsBefore.length>0);await t.reset();const restored=await t.state();assert.deepEqual(restored,JSON.parse(await fs.readFile(path.join(out,cfg.split,`${id}-01/evidence.json`),'utf8')).rounds[0].initial);const eventsAfter=await(await fetch(`http://127.0.0.1:${cfg.api}/api/test/events`)).json();assert.equal(eventsAfter.length,0);results.push({site:id,check:'reset',pass:true});console.log('PASS',id,'reset');}catch(e){results.push({site:id,check:'healthy-or-reset',pass:false,error:e.stack});console.error('FAIL',id,'healthy/reset',e.message);}
 await context.close();await stop();
 }
}finally{await browser.close();await stop();await fs.writeFile(path.join(out,`summary-${requested.length?requested.join('_'):split}.json`),JSON.stringify({createdAt:new Date().toISOString(),purpose:'QA regression only; never training episodes/reward data',results,passed:results.filter(x=>x.pass).length,failed:results.filter(x=>!x.pass).length},null,2));}
if(results.some(x=>!x.pass))process.exitCode=1;
