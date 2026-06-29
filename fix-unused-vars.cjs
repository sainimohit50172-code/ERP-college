const fs = require('fs');
const path = require('path');
const cwd = process.cwd();
const reportPath = path.join(cwd, 'lint-output.json');
if (!fs.existsSync(reportPath)) {
  console.error('lint-output.json not found');
  process.exit(1);
}
const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
const warnings = report.flatMap((file) => file.messages.map((m) => ({ filePath: file.filePath, ...m })));
const grouped = new Map();
for (const warning of warnings) {
  if (warning.ruleId !== 'no-unused-vars') continue;
  const rel = path.relative(cwd, warning.filePath);
  if (!grouped.has(rel)) grouped.set(rel, []);
  grouped.get(rel).push(warning);
}
const escape = (text) => text.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&');
const renameBinding = (line, name) => {
  const escaped = escape(name);
  const rx = new RegExp(`\\b${escaped}\\b`, 'g');
  return line.replace(rx, `_${name}`);
};
const removeImportSpecifier = (line, name) => {
  const importNamed = line.match(/^(\s*)import\s+\{([^}]+)\}\s+from\s+(.+);?$/);
  if (!importNamed) return null;
  const [_, indent, specifiers, source] = importNamed;
  const items = specifiers.split(',').map((item) => item.trim()).filter(Boolean);
  const remaining = items.filter((item) => {
    const local = item.split(/\s+as\s+/)[1] || item.split(/\s+as\s+/)[0];
    return local.trim() !== name;
  });
  if (remaining.length === items.length) return null;
  if (remaining.length === 0) return '';
  return `${indent}import { ${remaining.join(', ')} } from ${source};`;
};
for (const [relPath, fileWarnings] of grouped.entries()) {
  const absPath = path.resolve(cwd, relPath);
  if (!fs.existsSync(absPath)) continue;
  const source = fs.readFileSync(absPath, 'utf8');
  const lines = source.split(/\r?\n/);
  fileWarnings.sort((a, b) => b.line - a.line || b.column - a.column);
  for (const warning of fileWarnings) {
    const idx = warning.line - 1;
    if (idx < 0 || idx >= lines.length) continue;
    let line = lines[idx];
    const definedMatch = warning.message.match(/'(.+?)' is defined but never used\.|'(.+?)' is assigned a value but never used\./);
    if (!definedMatch) continue;
    const name = definedMatch[1] || definedMatch[2];
    if (!name) continue;
    const trimmed = line.trim();
    if (/^import\s+React\b/.test(trimmed)) {
      lines.splice(idx, 1);
      continue;
    }
    if (/^import\s+\{/.test(trimmed) && trimmed.includes(name)) {
      const updated = removeImportSpecifier(line, name);
      if (updated !== null) {
        if (updated === '') {
          lines.splice(idx, 1);
        } else {
          lines[idx] = updated;
        }
        continue;
      }
    }
    if (/^import\s+\*\s+as\s+/.test(trimmed) && trimmed.includes(name)) {
      lines.splice(idx, 1);
      continue;
    }
    if (/^import\s+\w+\s+from\s+/.test(trimmed) && trimmed.includes(name)) {
      lines.splice(idx, 1);
      continue;
    }
    if (/^const\s+\w+\s*=\s*usePermissions\(\)\s*;?$/.test(trimmed)) {
      lines.splice(idx, 1);
      continue;
    }
    if (/^const\s+\{/.test(trimmed) || /^let\s+\{/.test(trimmed) || /^var\s+\{/.test(trimmed)) {
      const objectParts = line.split('{');
      const before = objectParts.shift();
      const rest = objectParts.join('{');
      const closeIndex = rest.lastIndexOf('}');
      if (closeIndex !== -1) {
        const items = rest.slice(0, closeIndex).split(',').map((item) => item.trim());
        const updatedItems = items.map((item) => {
          if (!item) return item;
          const [left, right] = item.split(':').map((part) => part.trim());
          const local = right || left;
          if (local === name) {
            return right ? `${left}: _${local}` : `_${local}`;
          }
          return item;
        });
        if (updatedItems.some((item, i) => item !== items[i])) {
          lines[idx] = `${before}{ ${updatedItems.join(', ')} }${rest.slice(closeIndex + 1)}`;
          continue;
        }
      }
    }
    if (/^const\s+\[/.test(trimmed) || /^let\s+\[/.test(trimmed) || /^var\s+\[/.test(trimmed)) {
      const bracketIndex = line.indexOf('[');
      const closeIndex = line.indexOf(']');
      if (bracketIndex !== -1 && closeIndex !== -1) {
        const items = line.slice(bracketIndex + 1, closeIndex).split(',').map((item) => item.trim());
        const updated = items.map((item) => (item === name ? `_${item}` : item));
        if (updated.some((item, i) => item !== items[i])) {
          lines[idx] = `${line.slice(0, bracketIndex + 1)}${updated.join(', ')}]${line.slice(closeIndex + 1)}`;
          continue;
        }
      }
    }
    const assignMatch = line.match(/^(\s*)(const|let|var)\s+([\w$]+)(\s*=.*)$/);
    if (assignMatch && assignMatch[3] === name) {
      lines[idx] = `${assignMatch[1]}${assignMatch[2]} _${name}${assignMatch[4]}`;
      continue;
    }
    if (/\buseMemo\b/.test(line) && line.includes(name)) {
      lines[idx] = renameBinding(line, name);
      continue;
    }
    if (/\buseState\b/.test(line) && line.includes(name)) {
      lines[idx] = renameBinding(line, name);
      continue;
    }
    if (/\buseQuery\b/.test(line) && line.includes(name)) {
      lines[idx] = renameBinding(line, name);
      continue;
    }
    if (/\buseMutation\b/.test(line) && line.includes(name)) {
      lines[idx] = renameBinding(line, name);
      continue;
    }
    if (/[^\w]useForm\(/.test(line) && line.includes(name)) {
      lines[idx] = renameBinding(line, name);
      continue;
    }
    if (line.includes(name)) {
      lines[idx] = renameBinding(line, name);
    }
  }
  fs.writeFileSync(absPath, lines.join('\n'), 'utf8');
}
console.log('Updated files:', [...grouped.keys()].join(', '));
