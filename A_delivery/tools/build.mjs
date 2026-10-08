import {spawnSync} from 'node:child_process';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {sites} from '../shared/sites.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
for(const [id,c] of Object.entries(sites)){const bin=c.kind==='next'?'next/dist/bin/next':'vite/bin/vite.js';const r=spawnSync(process.execPath,[path.join(root,'node_modules',bin),'build'],{cwd:path.join(root,id),stdio:'inherit',env:{...process.env,NEXT_TELEMETRY_DISABLED:'1'}});if(r.status!==0)process.exit(r.status||1);}
