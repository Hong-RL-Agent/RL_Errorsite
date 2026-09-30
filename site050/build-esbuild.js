import esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function build() {
  const distDir = path.join(__dirname, 'dist');
  const distAssetsDir = path.join(distDir, 'assets');

  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }
  if (!fs.existsSync(distAssetsDir)) {
    fs.mkdirSync(distAssetsDir, { recursive: true });
  }

  // Copy or create index.html
  let indexHtml = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
  indexHtml = indexHtml.replace('/src/main.jsx', '/assets/bundle.js');
  indexHtml = indexHtml.replace('</head>', '<link rel="stylesheet" href="/assets/bundle.css"></head>');
  fs.writeFileSync(path.join(distDir, 'index.html'), indexHtml);

  // Bundle with esbuild
  try {
    await esbuild.build({
      entryPoints: [path.join(__dirname, 'src', 'main.jsx')],
      bundle: true,
      minify: true,
      sourcemap: false,
      outfile: path.join(distAssetsDir, 'bundle.js'),
      loader: { '.js': 'jsx', '.jsx': 'jsx', '.svg': 'dataurl', '.png': 'dataurl' },
      define: { 'process.env.NODE_ENV': '"production"' },
    });
    console.log('Build completed successfully!');
  } catch (err) {
    console.error('Build failed:', err);
    process.exit(1);
  }
}

build();
