import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Target both standard Nuxt output and Vercel build output
const candidateDirs = [
  path.resolve(__dirname, '../.output/public'),
  path.resolve(__dirname, '../.vercel/output/static'),
];

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

let initScriptContent = '';

// Check if an existing app-init.js exists in any output directory
for (const dir of candidateDirs) {
  const existingAppInit = path.join(dir, '_nuxt/app-init.js');
  if (fs.existsSync(existingAppInit)) {
    try {
      initScriptContent = fs.readFileSync(existingAppInit, 'utf-8');
      if (initScriptContent) break;
    } catch {}
  }
}

// Fallback safe definition if none extracted yet
const fallbackInit = 'window.__NUXT__=window.__NUXT__||{};window.__NUXT__.config=window.__NUXT__.config||{public:{apiBase:"/api",allowBrowser:true},app:{baseURL:"/",buildAssetsDir:"/_nuxt/",cdnURL:""}};';

for (const publicDir of candidateDirs) {
  if (!fs.existsSync(publicDir)) continue;

  const htmlFiles = findHtmlFiles(publicDir);
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

  // Ensure _nuxt/app-init.js ALWAYS exists in THIS output directory
  const nuxtDir = path.join(publicDir, '_nuxt');
  if (!fs.existsSync(nuxtDir)) {
    fs.mkdirSync(nuxtDir, { recursive: true });
  }
  const finalContent = initScriptContent || fallbackInit;
  fs.writeFileSync(path.join(nuxtDir, 'app-init.js'), finalContent, 'utf-8');
  console.log(`[post-build-csp] Successfully ensured ${path.join(nuxtDir, 'app-init.js')} exists across ${htmlFiles.length} HTML files.`);
}
