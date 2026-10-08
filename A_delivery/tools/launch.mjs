import {spawn} from 'node:child_process';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {sites} from '../shared/sites.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const args=process.argv.slice(2),production=args.includes('--production');
const selected=args.filter(x=>sites[x]);
const ids=selected.length?selected:Object.keys(sites),children=[];
for(const id of ids){const c=sites[id];children.push(spawn(process.execPath,[path.join(root,'backend/server.mjs'),id],{cwd:root,stdio:'inherit'}));const bin=c.kind==='next'?'next/dist/bin/next':'vite/bin/vite.js';let frontArgs=c.kind==='next'?[production?'start':'dev','--hostname','127.0.0.1','--port',String(c.port)]:[...(production?['preview']:[]),'--host','127.0.0.1','--port',String(c.port),'--strictPort'];children.push(spawn(process.execPath,[path.join(root,'node_modules',bin),...frontArgs],{cwd:path.join(root,id),stdio:'inherit',env:{...process.env,NEXT_TELEMETRY_DISABLED:'1'}}));}
console.log('Sites:',ids.map(id=>`${id} http://127.0.0.1:${sites[id].port}`).join('\n'));
let stopping=false;
function stop(){if(stopping)return;stopping=true;for(const child of children)child.kill();setTimeout(()=>process.exit(0),500);}
process.on('SIGINT',stop);process.on('SIGTERM',stop);
for(const child of children)child.on('exit',code=>{if(code&&!stopping){console.error('Child exited:',code);stop();}});
