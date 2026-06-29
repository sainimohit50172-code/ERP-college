const fs = require('fs');
const report = JSON.parse(fs.readFileSync('lint-output.json','utf8'));
const warnings = report.flatMap(file => file.messages.map(m => ({ file: file.filePath, ...m })));
const relevant = warnings.filter(w => w.file.endsWith('src/services/rbac.js') || w.file.endsWith('src/api/axios.js') || w.file.endsWith('src/components/ui/Button.jsx') || w.file.endsWith('src/hooks/useResource.js') || w.file.endsWith('src/hooks/useResourceHooks.js') || w.file.includes('src/pages/'));
const byFile = new Map();
for (const w of relevant) {
  if (!byFile.has(w.file)) byFile.set(w.file, []);
  byFile.get(w.file).push(w);
}
for (const [file, items] of byFile) {
  console.log('=== ' + file + ' (' + items.length + ') ===');
  for (const w of items) {
    console.log(w.line + ':' + w.column + ' ' + w.message);
  }
}
