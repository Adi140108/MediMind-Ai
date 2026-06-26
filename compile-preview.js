const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const publicDir = path.join(__dirname, 'public');
const distDir = path.join(__dirname, 'dist');

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
console.log('✓ Copied public assets to dist/');

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

// 1. Read layout and extract shell
const layoutPath = path.join(srcDir, 'layouts', 'Layout.astro');
const parsedLayout = parseAstro(layoutPath);

// Create the basic index.html shell from Layout
let indexHtml = `<!doctype html>
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
		
		<title>MediMind AI – Your Intelligent Health Companion</title>
    <link rel="stylesheet" href="global.css" />
    <style id="component-styles"></style>
	</head>
	<body>
    <!-- APP_CONTENT -->
    <script id="component-scripts"></script>
	</body>
</html>`;

// 2. Read and parse global.css
const globalCssPath = path.join(srcDir, 'styles', 'global.css');
let globalCss = '';
if (fs.existsSync(globalCssPath)) {
  globalCss = fs.readFileSync(globalCssPath, 'utf-8');
}
fs.writeFileSync(path.join(distDir, 'global.css'), globalCss);
console.log('✓ Compiled global.css');

// 3. Components to load in order
const components = [
  'Header.astro',
  'Hero.astro',
  'Stats.astro',
  'About.astro',
  'Features.astro',
  'DashboardPreview.astro',
  'HowItWorks.astro',
  'WhyChoose.astro',
  'Testimonials.astro',
  'Pricing.astro',
  'FAQs.astro',
  'Contact.astro',
  'Footer.astro'
];

let compiledHtml = '';
let compiledCss = '';
let compiledJs = '';

for (const comp of components) {
  const compPath = path.join(srcDir, 'components', comp);
  if (fs.existsSync(compPath)) {
    const parsed = parseAstro(compPath);
    compiledHtml += `\n<!-- Section: ${comp} -->\n${parsed.html}\n`;
    if (parsed.css) {
      compiledCss += `\n/* Style: ${comp} */\n${parsed.css}\n`;
    }
    if (parsed.js) {
      // Remove any typescript assertions or types to prevent JS syntax error
      let jsProcessed = parsed.js
        .replace(/as HTMLFormElement/g, '')
        .replace(/: HTMLFormElement/g, '')
        .replace(/: HTMLElement/g, '')
        .replace(/: Element/g, '');
      compiledJs += `\n// Script: ${comp}\n(function(){\n${jsProcessed}\n})();\n`;
    }
    console.log(`✓ Compiled component: ${comp}`);
  } else {
    console.warn(`⚠ Component not found: ${comp}`);
  }
}

// 4. Ingest into shell
indexHtml = indexHtml
  .replace('<!-- APP_CONTENT -->', compiledHtml)
  .replace('<style id="component-styles"></style>', `<style id="component-styles">\n${compiledCss}\n</style>`)
  .replace('<script id="component-scripts"></script>', `<script id="component-scripts">\n${compiledJs}\n</script>`);

fs.writeFileSync(path.join(distDir, 'index.html'), indexHtml);
console.log('✓ Generated dist/index.html');
console.log('✨ Build succeeded! Output in dist/');
