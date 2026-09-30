import * as esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';

async function buildApp() {
  if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist', { recursive: true });
  }
  if (!fs.existsSync('dist/assets')) {
    fs.mkdirSync('dist/assets', { recursive: true });
  }

  // Bundle JS & CSS
  const result = await esbuild.build({
    entryPoints: ['src/main.jsx'],
    bundle: true,
    minify: true,
    sourcemap: false,
    format: 'esm',
    target: ['es2020'],
    outfile: 'dist/assets/index.js',
    loader: {
      '.jsx': 'jsx',
      '.js': 'js',
      '.css': 'css',
      '.png': 'dataurl',
      '.svg': 'dataurl'
    },
    define: {
      'process.env.NODE_ENV': '"production"'
    }
  });

  // Copy and create dist/index.html
  const htmlContent = `<!DOCTYPE html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%230284c7'><path d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z'/></svg>" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>TripNest | 특별한 이벤트 & 로컬 체험 예약 플랫폼</title>
    <meta name="description" content="전국 각지의 이색 체험, 원데이 클래스, 로컬 투어, 프라이빗 이벤트를 손쉽게 검색하고 예약하세요." />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Noto+Sans+KR:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/assets/index.css">
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/assets/index.js"></script>
  </body>
</html>`;

  fs.writeFileSync('dist/index.html', htmlContent);
  console.log('✅ esbuild production bundle generated successfully in dist/');
}

buildApp().catch(e => {
  console.error('Build failed:', e);
  process.exit(1);
});
