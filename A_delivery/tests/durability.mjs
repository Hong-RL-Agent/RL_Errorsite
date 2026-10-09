import assert from 'node:assert/strict';
import {spawn,spawnSync} from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {sites} from '../shared/sites.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),results=[];
const mutations={
 'A-01':['items',{id:5}], 'A-02':['publish',{title:'DB 유지 확인',content:'테스트'}],
 'A-03':['join',{id:5}], 'A-04':['dish',{id:5}], 'A-05':['dates',{date:'2026-10-24',nights:3}],
 'A-06':['destination',{city:'대전',transport:'버스'}], 'A-07':['contact',{value:'010-2222-3333'}],
 'A-08':['checkout',{id:4}], 'A-09':['seat',{id:'B2'}], 'A-10':['calendar',{day:'2026-10-24'}]
};
let child;
function stop(){if(!child)return;if(process.platform==='win32')spawnSync('taskkill',['/PID',String(child.pid),'/T','/F'],{stdio:'ignore'});else child.kill();child=null;}
async function start(id){child=spawn(process.execPath,[path.join(root,'backend/server.mjs'),id],{cwd:root,stdio:'ignore'});for(let n=0;n<100;n++){try{let r=await fetch(`http://127.0.0.1:${sites[id].api}/api/health`);if(r.ok&&((await r.json()).site===id))return;}catch{}await new Promise(r=>setTimeout(r,100));}throw new Error('Startup timeout');}
try{for(const [id,cfg] of Object.entries(sites)){
 await start(id);const base=`http://127.0.0.1:${cfg.api}`;
 await fetch(base+'/api/test/reset',{method:'POST'});const initial=await(await fetch(base+cfg.path)).json();
 const [op,body]=mutations[id];const response=await fetch(base+cfg.path+'/'+op,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});assert(response.ok);
 const before=await(await fetch(base+cfg.path)).json();assert.notDeepEqual(before,initial);
 stop();await start(id);const after=await(await fetch(base+cfg.path)).json();assert.deepEqual(after,before);
 await fetch(base+'/api/test/reset',{method:'POST'});assert.deepEqual(await(await fetch(base+cfg.path)).json(),initial);
 results.push({site:id,pass:true,check:'SQLite survives backend restart; reset restores initial state'});console.log('PASS durability',id);stop();
}}finally{stop();await fs.mkdir(path.join(root,'test-results'),{recursive:true});await fs.writeFile(path.join(root,'test-results','durability.json'),JSON.stringify({results},null,2));}
