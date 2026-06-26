const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const publicDir = path.join(__dirname, 'public');
const distDir = __dirname;

// Ensure dist directory exists
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Copy public assets to dist
function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}
copyDir(publicDir, distDir);
console.log('✓ Copied public assets to root/');

// Helper to parse Astro file
function parseAstro(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // Remove frontmatter
  let htmlContent = content;
  if (content.startsWith('---')) {
    const endFrontmatterIndex = content.indexOf('---', 3);
    if (endFrontmatterIndex !== -1) {
      htmlContent = content.substring(endFrontmatterIndex + 3).trim();
    }
  }
  
  // Extract <style> blocks
  let styles = '';
  const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  let match;
  while ((match = styleRegex.exec(htmlContent)) !== null) {
    styles += match[1] + '\n';
  }
  htmlContent = htmlContent.replace(styleRegex, '');
  
  // Extract <script> blocks
  let scripts = '';
  const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
  while ((match = scriptRegex.exec(htmlContent)) !== null) {
    scripts += match[1] + '\n';
  }
  htmlContent = htmlContent.replace(scriptRegex, '');
  
  return {
    html: htmlContent.trim(),
    css: styles.trim(),
    js: scripts.trim()
  };
}

// JavaScript cleaner for TypeScript elements
function cleanJS(js) {
  if (!js) return '';
  return js
    .replace(/\s+as\s+[A-Za-z0-9_]+/g, '')
    .replace(/:\s*HTML[A-Za-z0-9_]+/g, '')
    .replace(/:\s*HTMLElement/g, '')
    .replace(/:\s*Element/g, '');
}

// Read and parse global.css
const globalCssPath = path.join(srcDir, 'styles', 'global.css');
let globalCss = '';
if (fs.existsSync(globalCssPath)) {
  globalCss = fs.readFileSync(globalCssPath, 'utf-8');
}
fs.writeFileSync(path.join(distDir, 'global.css'), globalCss);
console.log('✓ Compiled global.css');

// HTML shell builder template
function buildHtmlShell(title, body, css, js) {
  return `<!doctype html>
<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<link rel="icon" type="image/svg+xml" href="favicon.svg" />
		<link rel="icon" href="favicon.ico" />
		<meta name="description" content="Monitor your health, check symptoms, manage medications, book appointments, and access your medical records—all powered by Artificial Intelligence." />
		
		<!-- Google Fonts: Inter and JetBrains Mono -->
		<link rel="preconnect" href="https://fonts.googleapis.com" />
		<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
		<link href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&display=swap" rel="stylesheet" />
		
		<title>${title}</title>
    <link rel="stylesheet" href="global.css" />
    <style id="component-styles">
${css}
    </style>
	</head>
	<body>
${body}
    <script id="component-scripts">
${js}
    </script>
	</body>
</html>`;
}

// Find all page files in src/pages/
const pagesDir = path.join(srcDir, 'pages');
if (fs.existsSync(pagesDir)) {
  const pageFiles = fs.readdirSync(pagesDir).filter(file => file.endsWith('.astro'));
  
  for (const pageFile of pageFiles) {
    const pagePath = path.join(pagesDir, pageFile);
    console.log(`\nCompiling page: ${pageFile}...`);
    
    const parsedPage = parseAstro(pagePath);
    
    // Parse title from <Layout title="...">
    const titleMatch = parsedPage.html.match(/<Layout\s+title="([^"]+)"\s*>/i);
    const title = titleMatch ? titleMatch[1] : 'MediMind AI – Your Intelligent Health Companion';
    
    // Extract contents inside Layout tag
    let pageBody = parsedPage.html;
    const layoutContentRegex = /<Layout[^>]*>([\s\S]*?)<\/Layout>/i;
    const layoutContentMatch = parsedPage.html.match(layoutContentRegex);
    if (layoutContentMatch) {
      pageBody = layoutContentMatch[1].trim();
    }
    
    // Process component inclusions
    let compiledHtml = pageBody;
    let compiledCss = parsedPage.css ? `${parsedPage.css}\n` : '';
    let compiledJs = parsedPage.js ? `${cleanJS(parsedPage.js)}\n` : '';
    
    // Scan for tags like <ComponentName />
    const compTags = compiledHtml.match(/<([A-Z][A-Za-z0-9_]*)\s*\/>/g) || [];
    for (const tag of compTags) {
      const compName = tag.match(/<([A-Z][A-Za-z0-9_]*)/)[1];
      const compPath = path.join(srcDir, 'components', `${compName}.astro`);
      if (fs.existsSync(compPath)) {
        const parsedComp = parseAstro(compPath);
        compiledHtml = compiledHtml.split(tag).join(parsedComp.html);
        if (parsedComp.css) {
          compiledCss += `\n/* Style: ${compName} */\n${parsedComp.css}\n`;
        }
        if (parsedComp.js) {
          compiledJs += `\n// Script: ${compName}\n(function(){\n${cleanJS(parsedComp.js)}\n})();\n`;
        }
        console.log(`  ✓ Inlined component: ${compName}`);
      } else {
        console.warn(`  ⚠ Component not found: ${compName}`);
      }
    }
    
    // Build and save final html
    const outputHtml = buildHtmlShell(title, compiledHtml, compiledCss, compiledJs);
    const outputFileName = pageFile.replace('.astro', '.html');
    const outputPath = path.join(distDir, outputFileName);
    fs.writeFileSync(outputPath, outputHtml);
    console.log(`✓ Generated root/${outputFileName}`);
  }
}

console.log('\n✨ Build succeeded! Output in root/');
