const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..', 'src');
const patterns = [
  /useResourceList\('([^']+)'\)/g,
  /useResourceDetails\('([^']+)'\)/g,
  /useCreateResource\('([^']+)'\)/g,
  /useUpdateResource\('([^']+)'\)/g,
  /useDeleteResource\('([^']+)'\)/g,
  /useBulkImport\('([^']+)'\)/g,
  /useSearchResource\('([^']+)'\)/g,
  /getEndpoint\('([^']+)'\)/g,
];
const files = [];
function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const fp = path.join(dir, name);
    const stat = fs.statSync(fp);
    if (stat.isDirectory()) walk(fp);
    else if (fp.endsWith('.js') || fp.endsWith('.jsx')) files.push(fp);
  }
}
walk(root);
const used = new Set();
for (const f of files) {
  const text = fs.readFileSync(f, 'utf8');
  for (const pat of patterns) {
    let match;
    while ((match = pat.exec(text))) {
      used.add(match[1]);
    }
    pat.lastIndex = 0;
  }
}
const endpointsText = fs.readFileSync(path.join(root, 'api', 'endpoints.js'), 'utf8');
const endpointKeys = new Set();
for (const line of endpointsText.split(/\r?\n/)) {
  const match = line.match(/^\s*([a-zA-Z0-9_]+):\s*['"]/);
  if (match) endpointKeys.add(match[1]);
}
const missing = Array.from(used).filter(x => !endpointKeys.has(x)).sort();
const unused = Array.from(endpointKeys).filter(x => !used.has(x)).sort();
console.log('USED KEY COUNT:', used.size);
console.log('ENDPOINT KEY COUNT:', endpointKeys.size);
console.log('MISSING IN ENDPOINTS:', missing.length);
missing.forEach((v) => console.log('  ', v));
console.log('UNUSED ENDPOINT KEYS:', unused.length);
unused.forEach((v) => console.log('  ', v));
