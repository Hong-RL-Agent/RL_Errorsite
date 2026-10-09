import express from 'express';
import cors from 'cors';
import {DatabaseSync} from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {sites} from '../shared/sites.mjs';
import {seed} from './seed.mjs';
const id=process.argv[2]||'A-01', config=sites[id];
if(!config) throw new Error('Unknown site');
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
fs.mkdirSync(path.join(root,'data',config.split),{recursive:true});
const db=new DatabaseSync(path.join(root,'data',config.split,`${id}.sqlite`));
db.exec('PRAGMA journal_mode=WAL; CREATE TABLE IF NOT EXISTS state (id INTEGER PRIMARY KEY CHECK(id=1), body TEXT NOT NULL); CREATE TABLE IF NOT EXISTS events (seq INTEGER PRIMARY KEY AUTOINCREMENT, method TEXT, endpoint TEXT, request TEXT, response TEXT, status INTEGER);');
const read=()=>JSON.parse(db.prepare('SELECT body FROM state WHERE id=1').get().body);
const write=s=>db.prepare('INSERT INTO state VALUES (1,?) ON CONFLICT(id) DO UPDATE SET body=excluded.body').run(JSON.stringify(s));
if(!db.prepare('SELECT id FROM state').get())write(seed(id));
const app=express(); app.use(cors());app.use(express.json());
app.use((req,res,next)=>{res.set('Cache-Control','no-store');next();});
app.get('/api/health',(_,res)=>res.json({site:id,status:'ok'}));
app.post('/api/test/reset',(_,res)=>{db.exec('BEGIN');try{write(seed(id));db.exec("DELETE FROM events; DELETE FROM sqlite_sequence WHERE name='events'; COMMIT");res.json({ok:true,site:id});}catch(e){db.exec('ROLLBACK');throw e;}});
app.get('/api/test/state',(_,res)=>res.json(read()));
app.get('/api/test/events',(_,res)=>res.json(db.prepare('SELECT * FROM events ORDER BY seq').all().map(e=>({...e,request:JSON.parse(e.request),response:JSON.parse(e.response)}))));
const base=config.path;
app.get(base,(_,res)=>res.json(read()));
app.all(`${base}/*`,(req,res)=>{
  let s=read(), b=req.body||{}, operation=req.path.slice(base.length+1), result, status=200;
  try {
    if(id==='A-01') {
      if(operation==='items'&&req.method==='POST'){let row=s.cart.find(x=>x.id===b.id);let qty=b.id===1?2:1;if(row)row.qty+=qty;else s.cart.push({id:b.id,qty});}
      else if(operation==='items'&&req.method==='DELETE'){if(b.id!==2)s.cart=s.cart.filter(x=>x.id!==b.id);}
      else if(operation==='quantity'){let row=s.cart.find(x=>x.id===b.id);if(row){if(b.id!==3&&b.qty<1){status=422;result={message:'수량은 1 이상입니다.'};}else row.qty=b.qty;}}
      else if(operation==='collection'){let target=b.id===4?5:b.id;s.saved=s.saved.includes(target)?s.saved.filter(x=>x!==target):[...s.saved,target];}
      else {status=404;result={message:'지원하지 않는 요청입니다.'};}
    } else if(id==='A-02') {
      if(operation==='publish'){const count=b.title==='회의 안내'?2:1;for(let i=0;i<count;i++)s.posts.push({id:s.nextId++,title:b.title,content:b.content||'',likes:0});}
      else if(operation==='remove'){if(b.id!==2)s.posts=s.posts.filter(x=>x.id!==b.id);}
      else if(operation==='revise'){let p=s.posts.find(x=>x.id===(b.id===3?4:b.id));if(p)p.content=b.content;}
      else if(operation==='applaud'){let p=s.posts.find(x=>x.id===b.id);if(p)p.likes+=b.id===1?2:1;}
      else {status=404;}
    } else if(id==='A-03') {
      if(operation==='join'){if(b.id!==1&&b.id!==4)s.enrolled.push(b.id,...(b.id===3?[b.id]:[]));if(b.id===4)result={...s,enrolled:[...s.enrolled,4]};}
      else if(operation==='withdraw'){if(b.id!==2)s.enrolled=s.enrolled.filter(x=>x!==b.id);}
      else status=404;
    } else if(id==='A-04') {
      if(operation==='dish'){let p=s.order.find(x=>x.id===b.id);let qty=b.id===1?2:1;if(p)p.qty+=qty;else s.order.push({id:b.id,qty});}
      else if(operation==='clear-dish'){if(b.id!==2)s.order=s.order.filter(x=>x.id!==b.id);}
      else if(operation==='voucher'){s.discount=b.code==='TAKE20'?-0.2:b.code==='SAVE10'?0.1:0;}
      else if(operation==='send'){s.receipt=s.order.map(x=>({...x,id:x.id===3?4:x.id}));}
      else status=404;
      s.total=Math.round(s.order.reduce((a,x)=>a+s.menus.find(p=>p.id===x.id).price*x.qty,0)*(1-s.discount));
    } else if(id==='A-05') {
      const f=s.flow;
      if(operation==='dates'){Object.assign(f,{dates:b.date,nights:Number(b.nights),step:1,history:['dates']});}
      else if(operation==='options'&&f.step===1){f.room=b.room;f.guests=Number(b.guests);f.breakfast=!!b.breakfast;f.step=2;f.history.push('options');}
      else if(operation==='back'&&f.step===2){f.step=1;f.history.push('back');}
      else if(operation==='review'&&f.step===2){const price={standard:50000,deluxe:80000,suite:120000,garden:60000}[f.room];let nights=f.room==='standard'&&f.nights===2?1:f.nights;if(f.room==='deluxe'&&f.history.includes('back'))f.breakfast=true;f.quote=price*nights*f.guests+(f.breakfast?10000*f.guests*nights:0);f.step=3;f.history.push('review');}
      else if(operation==='pay'&&f.step===3){s.charged+=f.quote;if(f.room==='suite'){status=409;result={...s,message:'객실 확정에 실패했습니다.'};}else{s.reservations.push({id:s.reservations.length+1,room:f.room,total:f.quote,status:'confirmed'});s.availability[f.room]--;f.step=4;}f.history.push('pay');}
      else if(operation==='cancel'&&f.step===4){let r=s.reservations.at(-1);r.status='cancelled';s.charged-=r.total;if(r.room!=='garden')s.availability[r.room]++;f.step=5;f.history.push('cancel');}
      else{status=409;result={message:'현재 단계에서 진행할 수 없습니다.'};}
    } else if(id==='A-06') {
      if(operation==='destination'){s.city=b.city;s.transport=b.transport;s.stage='planning';s.history.push('destination');}
      else if(operation==='draft'&&s.stage==='planning'){if(s.city==='강릉'&&s.history.includes('return')){s.stage='planning';}else{s.route=[{city:s.city,transport:s.transport,status:'draft'}];s.stage='review';}s.history.push('draft');}
      else if(operation==='return'&&s.stage==='review'){s.stage='planning';s.history.push('return');}
      else if(operation==='commit'&&s.stage==='review'){s.route[0].status='confirmed';s.stage='confirmed';s.capacity--;s.balance-=20000;s.history.push('commit');}
      else if(operation==='undo'&&s.stage==='confirmed'){s.route[0].status='cancelled';s.stage='cancelled';if(s.city!=='제주')s.capacity++;if(s.city!=='서울')s.balance+=20000;s.history.push('undo');}
      else if(operation==='share'&&s.stage==='cancelled'){if(s.city==='부산'){s.route[0].status='published';s.stage='published';}else{status=409;result={...s,message:'취소된 일정은 공개할 수 없습니다.'};}s.history.push('share');}
      else{status=409;result={message:'여행 순서를 확인해 주세요.'};}
    } else if(id==='A-07') {
      const fields={identity:'displayName',introduction:'bio',language:'locale',notifications:'newsletter',contact:'phone'};
      const field=fields[operation];if(!field){status=404;}else if(field==='phone'){s.profile.phone=b.value;}else result={...s,profile:{...s.profile,[field]:b.value}};
    } else if(id==='A-08') {
      if(operation==='checkout'){if(b.id===1)s.loans.push({id:1,due:'2026-10-25',fee:0},{id:1,due:'2026-10-25',fee:0});else if(!s.loans.some(x=>x.id===b.id))s.loans.push({id:b.id,due:'2026-10-25',fee:0});}
      else if(operation==='checkin'){s.loans=s.loans.filter(x=>x.id!==b.id);if(b.id!==2)s.fee=s.loans.reduce((a,x)=>a+x.fee,0);}
      else if(operation==='author'){s.query=b.query;s.matches=s.books.filter(x=>x.author.includes(b.query));}
      else if(operation==='edition'){s.year=b.year;s.matches=s.books.filter(x=>(b.year==='전체'||x.year===Number(b.year))&&(b.year==='2024'||x.author.includes(s.query)));}
      else if(operation==='renew'){if(b.id===3)result={...s,loans:s.loans.map(x=>x.id===3?{...x,due:'2026-11-01'}:x)};else{s.loans=s.loans.map(x=>x.id===b.id?{...x,due:'2026-11-01'}:x);}}
      else status=404;
    } else if(id==='A-09') {
      if(operation==='seat'){let seat=s.seats.find(x=>x.id===b.id);if(seat&&b.id!=='B1')seat.selected=!seat.selected;}
      else if(operation==='party'){s.count=Number(b.count);s.tier=b.tier;}
      else if(operation==='extras'){s.parking=!!b.parking;s.invoice=s.count*(s.tier==='페어'?40000:30000)+(s.tier==='페어'?10000:s.parking?10000:0);}
      else if(operation==='issue'){if(s.seats.some(x=>x.selected)){s.booking={seats:s.seats.filter(x=>x.selected).map(x=>x.id),status:'issued'};s.capacity-=s.booking.seats.length;}}
      else if(operation==='release'&&s.booking){s.booking.status='released';if(!s.booking.seats.includes('B3'))s.capacity+=s.booking.seats.length;s.seats.forEach(x=>x.selected=false);}
      else if(operation==='delivery'){result={...s,preference:b.value};}
      else status=404;
    } else if(id==='A-10') {
      if(operation==='party-size'){s.qty+=Number(b.delta)*2;}
      else if(operation==='calendar'){s.day=b.day;s.stage='times';}
      else if(operation==='showtime'&&s.stage==='times'){s.session=b.session;s.stage='review';}
      else if(operation==='hold'&&s.stage==='review'){s.reservation={day:s.session==='낮'?'2026-10-21':s.day,session:s.session,status:'held'};s.balance-=30000;s.stage='held';}
      else if(operation==='invite'){s.guest=b.guest;s.stage='invited';s.balance-=10000;}
      else if(operation==='revoke'&&s.stage==='invited'){s.guest='';s.stage='schedule';}
      else if(operation==='access'){result={...s,note:b.value};}
      else if(operation==='refresh-count'){s.qty=1;}
      else status=404;
    }
    write(s);if(!result)result=s;
    db.prepare('INSERT INTO events(method,endpoint,request,response,status) VALUES(?,?,?,?,?)').run(req.method,req.path,JSON.stringify(b),JSON.stringify(result),status);
    res.status(status).json(result);
  }catch(e){console.error(e);res.status(500).json({message:'요청 처리 실패'});}
});
app.use((_,res)=>res.status(404).json({message:'경로를 찾을 수 없습니다.'}));
const server=app.listen(Number(process.env.PORT)||config.api,'127.0.0.1',()=>console.log(`${id} API http://127.0.0.1:${Number(process.env.PORT)||config.api}`));
process.on('SIGTERM',()=>server.close(()=>{db.close();process.exit(0);}));
