import { createReadStream, existsSync } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve } from 'node:path';

const port = Number(process.env.PORT || 9062);
const host = process.env.HOST || '127.0.0.1';
const root = resolve('dist');
const backendTarget = process.env.BACKEND_TARGET || 'http://localhost:9063';

const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp'
};

function resolveRequestPath(url) {
  const pathname = decodeURIComponent(new URL(url, `http://${host}:${port}`).pathname);
  const candidate = normalize(join(root, pathname));
  if (!candidate.startsWith(root)) {
    return join(root, 'index.html');
  }
  return candidate;
}

async function sendFile(response, filePath) {
  const fileStat = await stat(filePath);
  response.writeHead(200, {
    'Content-Length': fileStat.size,
    'Content-Type': contentTypes[extname(filePath)] || 'application/octet-stream',
    'Cache-Control': filePath.endsWith('index.html') ? 'no-cache' : 'public, max-age=31536000, immutable'
  });
  createReadStream(filePath).pipe(response);
}

const server = createServer(async (request, response) => {
  try {
    if (request.url?.startsWith('/api/')) {
      const upstream = new URL(request.url, backendTarget);
      const proxyResponse = await fetch(upstream, {
        method: request.method,
        headers: request.headers,
        body: request.method === 'GET' || request.method === 'HEAD' ? undefined : request,
        duplex: request.method === 'GET' || request.method === 'HEAD' ? undefined : 'half'
      });
      response.writeHead(proxyResponse.status, Object.fromEntries(proxyResponse.headers));
      if (proxyResponse.body) {
        const reader = proxyResponse.body.getReader();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          response.write(value);
        }
      }
      response.end();
      return;
    }

    let filePath = resolveRequestPath(request.url || '/');
    if (!existsSync(filePath) || (await stat(filePath)).isDirectory()) {
      filePath = join(root, 'index.html');
    }
    await sendFile(response, filePath);
  } catch (error) {
    response.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end(`TWIN-FABRIC static server error: ${error.message}`);
  }
});

server.listen(port, host, () => {
  console.log(`TWIN-FABRIC UI serving http://${host}:${port}/`);
});
