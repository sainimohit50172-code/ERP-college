const fs = require('fs');
const path = require('path');
const root = process.cwd();
const pagesDir = path.join(root, 'src', 'pages');
const files = fs.readdirSync(pagesDir).filter((name) => name.endsWith('.jsx'));
for (const fileName of files) {
  const filePath = path.join(pagesDir, fileName);
  const text = fs.readFileSync(filePath, 'utf8');
  const hasReactImport = /import\s+\{[^}]*\}\s+from\s+['\"]react['\"]/m.test(text);
  const usesMemo = /\buseMemo\b/.test(text);
  const usesState = /\buseState\b/.test(text);
  const usesEffect = /\buseEffect\b/.test(text);
  const usesRef = /\buseRef\b/.test(text);
  const usesPermissionsImport = /import\s+\{\s*usePermissions\s*\}\s+from\s+['\"]\.\.\/services\/permissionHelpers\.js['\"]/m.test(text);
  const usesPermissionsCall = /\busePermissions\(/.test(text);
  const hasDoubleSemi = /;;/.test(text);
  const missingReact = (usesMemo || usesState || usesEffect || usesRef) && !hasReactImport;
  if (missingReact || (usesPermissionsImport && !usesPermissionsCall) || hasDoubleSemi) {
    console.log('===', fileName, '===');
    if (missingReact) console.log('  Missing React import for hooks:', usesMemo ? 'useMemo' : '', usesState ? 'useState' : '', usesEffect ? 'useEffect' : '', usesRef ? 'useRef' : '');
    if (usesPermissionsImport && !usesPermissionsCall) console.log('  Unused usePermissions import');
    if (hasDoubleSemi) console.log('  Has double semicolon');
  }
}
