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

// Extract real current buildId from builds/latest.json
let currentBuildId = '';
for (const dir of candidateDirs) {
  const latestJsonPath = path.join(dir, '_nuxt/builds/latest.json');
  if (fs.existsSync(latestJsonPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(latestJsonPath, 'utf-8'));
      if (data.id) {
        currentBuildId = data.id;
        break;
      }
    } catch {}
  }
}

for (const publicDir of candidateDirs) {
  if (!fs.existsSync(publicDir)) continue;

  const htmlFiles = findHtmlFiles(publicDir);
  for (const filePath of htmlFiles) {
    let content = fs.readFileSync(filePath, 'utf-8');
    const match = content.match(/<script>(window\.__NUXT__=\{[\s\S]*?)<\/script>/);
    if (match) {
      const rawTag = match[0];
      content = content.replace(rawTag, '<script src="/_nuxt/app-init.js"></script>');
      fs.writeFileSync(filePath, content, 'utf-8');
    }
  }

  // Ensure _nuxt/app-init.js ALWAYS exists with safe runtime config and NO mismatched buildId
  const nuxtDir = path.join(publicDir, '_nuxt');
  if (!fs.existsSync(nuxtDir)) {
    fs.mkdirSync(nuxtDir, { recursive: true });
  }
  const finalContent = 'window.__NUXT__=window.__NUXT__||{};window.__NUXT__.config=window.__NUXT__.config||{public:{apiBase:"/api",allowBrowser:true},app:{baseURL:"/",buildAssetsDir:"/_nuxt/",cdnURL:""}};';
  fs.writeFileSync(path.join(nuxtDir, 'app-init.js'), finalContent, 'utf-8');
  console.log(`[post-build-csp] Successfully ensured ${path.join(nuxtDir, 'app-init.js')} exists across ${htmlFiles.length} HTML files.`);
}

// Synchronize all files between .output/public and .vercel/output/static
const outputPublic = path.resolve(__dirname, '../.output/public');
const vercelStatic = path.resolve(__dirname, '../.vercel/output/static');

function copyFolderRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyFolderRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

if (fs.existsSync(outputPublic)) {
  copyFolderRecursive(outputPublic, vercelStatic);
  console.log('[post-build-csp] Successfully mirrored .output/public to .vercel/output/static');
}


