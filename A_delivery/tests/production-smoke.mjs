import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
import {sites} from '../shared/sites.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),results=[];
const browser=await chromium.launch({headless:true,channel:process.env.BROWSER_CHANNEL||'msedge'});
try{for(const [id,c] of Object.entries(sites)){
 const url=`http://127.0.0.1:${c.port}`;
 const health=await(await fetch(url+'/api/health')).json();assert.equal(health.site,id);
 const r=await fetch(url+'/api/test/reset',{method:'POST'});assert(r.ok);assert.equal((await r.json()).site,id);
 const initial=await(await fetch(url+c.path)).json();
 const page=await browser.newPage();let loaded=page.waitForResponse(r=>r.url().endsWith(c.path));await page.goto(url);await(await loaded).finished();
 const textbox=page.getByRole('textbox').first();let temporary='임시 입력';if(await textbox.count()){if(await textbox.getAttribute('type')==='date')temporary='2026-11-15';await textbox.fill(temporary);}
 const reset=page.waitForResponse(r=>r.url().endsWith('/api/test/reset')&&r.request().method()==='POST');
 loaded=page.waitForResponse(r=>r.url().endsWith(c.path));await page.getByRole('button',{name:'처음부터',exact:true}).click();assert((await reset).ok());await(await loaded).finished();
 assert.deepEqual(await(await fetch(url+c.path)).json(),initial);
 if(await textbox.count())assert.notEqual(await textbox.inputValue(),temporary);
 const html=await page.content();assert(!html.includes('data-bug-id'));assert(!html.includes('bug_catalog'));
 results.push({site:id,production_http:'PASS',frontend_api_proxy:'PASS',reset_button_and_form:'PASS'});console.log('PASS production',id);await page.close();
}}finally{await browser.close();await fs.writeFile(path.join(root,'test-results/production-smoke.json'),JSON.stringify({results},null,2));}
