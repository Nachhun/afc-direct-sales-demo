import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.resolve(__dirname, '../.output/public');

function findHtmlFiles(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      results = results.concat(findHtmlFiles(fullPath));
    } else if (file.endsWith('.html')) {
      results.push(fullPath);
    }
  }
  return results;
}

const htmlFiles = findHtmlFiles(publicDir);
let initScriptContent = '';

for (const filePath of htmlFiles) {
  let content = fs.readFileSync(filePath, 'utf-8');
  const match = content.match(/<script>(window\.__NUXT__=\{[\s\S]*?)<\/script>/);
  if (match) {
    const rawTag = match[0];
    const scriptCode = match[1];
    if (!initScriptContent) {
      initScriptContent = scriptCode;
    }
    content = content.replace(rawTag, '<script src="/_nuxt/app-init.js"></script>');
    fs.writeFileSync(filePath, content, 'utf-8');
  }
}

if (initScriptContent) {
  const nuxtDir = path.join(publicDir, '_nuxt');
  if (!fs.existsSync(nuxtDir)) {
    fs.mkdirSync(nuxtDir, { recursive: true });
  }
  fs.writeFileSync(path.join(nuxtDir, 'app-init.js'), initScriptContent, 'utf-8');
  console.log(`[post-build-csp] Extracted Nuxt bootstrapping script to /_nuxt/app-init.js across ${htmlFiles.length} HTML files.`);
} else {
  console.log('[post-build-csp] No inline window.__NUXT__ script found to externalize.');
}
