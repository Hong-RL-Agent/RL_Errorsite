import esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Copy index.html and update script tag
let indexHtml = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
indexHtml = indexHtml.replace('/src/main.jsx', '/bundle.js');
fs.writeFileSync(path.join(distDir, 'index.html'), indexHtml);

esbuild.build({
  entryPoints: [path.join(__dirname, 'src', 'main.jsx')],
  bundle: true,
  outfile: path.join(distDir, 'bundle.js'),
  loader: {
    '.js': 'jsx',
    '.jsx': 'jsx',
    '.css': 'css',
    '.png': 'dataurl',
    '.jpg': 'dataurl',
    '.svg': 'dataurl'
  },
  define: {
    'process.env.NODE_ENV': '"production"'
  },
  minify: false,
  sourcemap: false
}).then(() => {
  console.log('Build completed successfully!');
}).catch((err) => {
  console.error('Build failed:', err);
  process.exit(1);
});
