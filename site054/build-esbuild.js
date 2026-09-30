import esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function build() {
  const distDir = path.join(__dirname, 'dist');
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }

  await esbuild.build({
    entryPoints: [path.join(__dirname, 'src', 'main.jsx')],
    bundle: true,
    minify: false,
    sourcemap: false,
    outfile: path.join(distDir, 'assets', 'index.js'),
    loader: {
      '.js': 'jsx',
      '.jsx': 'jsx',
      '.css': 'css'
    },
    define: {
      'process.env.NODE_ENV': '"production"'
    }
  });

  const htmlContent = `<!DOCTYPE html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>📚</text></svg>" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>BookNest — 온라인 도서관 & 전자책 대여 플랫폼</title>
    <link rel="stylesheet" href="/assets/index.css">
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/assets/index.js"></script>
  </body>
</html>`;

  fs.writeFileSync(path.join(distDir, 'index.html'), htmlContent, 'utf-8');
  console.log('Build completed successfully!');
}

build().catch(err => {
  console.error(err);
  process.exit(1);
});
