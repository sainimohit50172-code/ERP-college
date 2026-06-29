const fs = require('fs');
const path = require('path');

const root = process.cwd();
const pagesDir = path.join(root, 'src', 'pages');
const pageFiles = fs.readdirSync(pagesDir).filter((name) => name.endsWith('.jsx'));

for (const pageFile of pageFiles) {
  const filePath = path.join(pagesDir, pageFile);
  let text = fs.readFileSync(filePath, 'utf8');
  const lines = text.split(/\r?\n/);
  let modified = false;

  const usePermissionsImport = /^\s*import\s+\{\s*usePermissions\s*\}\s+from\s+['"]\.\.\/services\/permissionHelpers\.js['"]\s*;?\s*$/;
  const usesUsePermissions = /\busePermissions\(/.test(text);
  const hasReactImport = lines.some((line) => /^\s*import\s+\{[^}]*\}\s+from\s+['"]react['"]\s*;?\s*$/.test(line));
  const needsUseMemo = /\buseMemo\b/.test(text);
  const needsUseState = /\buseState\b/.test(text);

  const newLines = lines
    .map((line) => {
      if (usePermissionsImport.test(line) && !usesUsePermissions) {
        modified = true;
        return null;
      }
      if (/^\s*import.*;;/.test(line)) {
        modified = true;
        return line.replace(/;;+/g, ';');
      }
      return line;
    })
    .filter(Boolean);

  if ((needsUseMemo || needsUseState) && !hasReactImport) {
    const hookImports = [];
    if (needsUseMemo) hookImports.push('useMemo');
    if (needsUseState) hookImports.push('useState');
    const insertPos = newLines.findIndex((line) => /^\s*import\s+/.test(line));
    if (insertPos !== -1) {
      newLines.splice(insertPos, 0, `import { ${hookImports.join(', ')} } from 'react';`);
      modified = true;
    }
  }

  if (hasReactImport) {
    const reactIndex = newLines.findIndex((line) => /^\s*import\s+\{[^}]*\}\s+from\s+['"]react['"]\s*;?\s*$/.test(line));
    if (reactIndex !== -1) {
      const line = newLines[reactIndex];
      const match = line.match(/^\s*import\s+\{([^}]*)\}\s+from\s+['"]react['"]\s*;?\s*$/);
      if (match) {
        const existing = match[1].split(',').map((item) => item.trim()).filter(Boolean);
        const additions = [];
        if (needsUseMemo && !existing.includes('useMemo')) additions.push('useMemo');
        if (needsUseState && !existing.includes('useState')) additions.push('useState');
        if (additions.length) {
          const merged = [...existing, ...additions].join(', ');
          newLines[reactIndex] = `import { ${merged} } from 'react';`;
          modified = true;
        }
      }
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, newLines.join('\n'));
    console.log(`Patched ${pageFile}`);
  }
}
