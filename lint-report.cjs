const fs = require('fs');
const path = require('path');
const cwd = process.cwd();
const reportPath = path.join(cwd, 'lint-output.json');
if (!fs.existsSync(reportPath)) {
  console.error('lint-output.json not found');
  process.exit(1);
}
const rawJson = fs.readFileSync(reportPath, 'utf8').replace(/^\uFEFF/, '');
const report = JSON.parse(rawJson);
const warnings = report.flatMap(file => file.messages.map(m => ({ file: file.filePath, ...m })));
const counts = warnings.reduce((acc, w) => {
  acc[w.ruleId] = (acc[w.ruleId] || 0) + 1;
  return acc;
}, {});
console.log('total=' + warnings.length);
Object.entries(counts).forEach(([rule, count]) => console.log(`${rule}:${count}`));
const byFile = warnings.reduce((acc, w) => {
  acc[w.file] ??= [];
  acc[w.file].push(w);
  return acc;
}, {});
for (const [file, items] of Object.entries(byFile).sort()) {
  console.log(`=== ${file} (${items.length}) ===`);
  items.forEach((w) => console.log(`${w.line}:${w.column} ${w.message}`));
}
