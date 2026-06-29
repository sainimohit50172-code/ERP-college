const fs = require('fs');
const path = require('path');
const reportPath = path.resolve('lint-output.json');
if (!fs.existsSync(reportPath)) {
  console.error('lint-output.json not found');
  process.exit(1);
}
const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
const warnings = report.flatMap(file => file.messages.map(m => ({ filePath: file.filePath, ...m })));
const files = new Map();
for (const warning of warnings) {
  const relPath = path.relative(process.cwd(), warning.filePath);
  if (!files.has(relPath)) {
    const contents = fs.readFileSync(relPath, 'utf8').split(/\r?\n/);
    files.set(relPath, contents);
  }
  const lines = files.get(relPath);
  const lineIndex = warning.line - 1;
  if (lineIndex < 0 || lineIndex >= lines.length) continue;
  let line = lines[lineIndex];
  const unusedMatch = warning.message.match(/'(.+?)' is defined but never used\.|'(.+?)' is assigned a value but never used\./);
  if (!unusedMatch) {
    continue;
  }
  const variableName = unusedMatch[1] || unusedMatch[2];
  const importDefaultRegex = new RegExp(`^\s*import\s+${variableName}\\b`);
  const importNamedRegex = new RegExp(`^\s*import\s+\{([^}]+)\}\s+from\s+['\"].+['\"];?`);
  if (importDefaultRegex.test(line)) {
    // remove whole default import line
    console.log(`Removing default import ${variableName} from ${relPath}:${warning.line}`);
    lines.splice(lineIndex, 1);
    continue;
  }
  const namedMatch = line.match(importNamedRegex);
  if (namedMatch && line.includes(variableName)) {
    const specifiers = namedMatch[1].split(',').map(s => s.trim()).filter(Boolean);
    const remaining = specifiers.filter(spec => {
      const name = spec.split(/\s+as\s+/)[0].trim();
      return name !== variableName;
    });
    if (remaining.length === 0) {
      console.log(`Removing import line ${relPath}:${warning.line} because ${variableName} was sole specifier`);
      lines.splice(lineIndex, 1);
    } else {
      const _sep = line.includes('{ ') ? '{ ' : '{';
      const newLine = line.replace(importNamedRegex, `import { ${remaining.join(', ')} } from ${line.split(' from ')[1]}`);
      console.log(`Removing import specifier ${variableName} from ${relPath}:${warning.line}`);
      lines[lineIndex] = newLine;
    }
    continue;
  }
  const importNamespaceRegex = new RegExp(`^\s*import\s+\*\s+as\s+${variableName}\b`);
  if (importNamespaceRegex.test(line)) {
    console.log(`Removing namespace import ${variableName} from ${relPath}:${warning.line}`);
    lines.splice(lineIndex, 1);
    continue;
  }
  // For remaining cases, rename the binding to an ignored variable name
  const escapedName = variableName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const _lineBefore = line;
  const regex = new RegExp(`\b${escapedName}\b`, 'g');
  if (line.match(regex)) {
    line = line.replace(regex, `_${variableName}`);
    lines[lineIndex] = line;
    console.log(`Prefixed unused variable ${variableName} in ${relPath}:${warning.line}`);
  }
}
for (const [relPath, lines] of files.entries()) {
  fs.writeFileSync(relPath, lines.join('\n'), 'utf8');
}
console.log('Done');
