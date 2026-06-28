const fs = require('fs');
const path = require('path');
const root = process.cwd();
function walkDir(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) walkDir(full, out);
    else if (/\.(js|jsx)$/.test(name)) out.push(path.relative(root, full).replace(/\\/g, '/'));
  }
  return out;
}
const files = walkDir(path.join(root, 'src'));
const resourceSet = new Set();
const endpointSet = new Set();
const extract = /(?:useResourceList|useCreateResource|useUpdateResource|useDeleteResource|createResourceService|getEndpoint)\((?:'|")(.+?)(?:'|")\)/g;
for (const file of files) {
  const text = fs.readFileSync(path.join(root, file), 'utf8');
  for (const match of text.matchAll(extract)) {
    resourceSet.add(match[1]);
  }
}
const endptFile = path.join(root, 'src/api/endpoints.js');
const endptText = fs.readFileSync(endptFile, 'utf8');
for (const match of endptText.matchAll(/^\s*([a-zA-Z0-9_]+):\s*['\"]([^'\"]+)['\"]/gm)) {
  endpointSet.add(match[1]);
}
const referenced = Array.from(resourceSet).sort();
const mapped = Array.from(endpointSet).sort();
const missing = referenced.filter(x => !endpointSet.has(x));
const unused = mapped.filter(x => !resourceSet.has(x));
console.log('Referenced resources:', referenced.join(', '));
console.log('Mapped endpoints:', mapped.join(', '));
console.log('Missing endpoints:', missing.join(', '));
console.log('Unused endpoint keys:', unused.join(', '));
