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
    let m;
    while ((m = pat.exec(text))) {
      used.add(m[1]);
    }
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
console.log('USED RESOURCE KEYS (' + used.size + '):');
for (const res of Array.from(used).sort()) console.log(res);
console.log('\nENDPOINT KEYS (' + endpointKeys.size + '):');
for (const res of Array.from(endpointKeys).sort()) console.log(res);
console.log('\nMISSING IN ENDPOINTS (' + missing.length + '):');
for (const res of missing) console.log(res);
console.log('\nUNUSED ENDPOINT KEYS (' + unused.length + '):');
for (const res of unused) console.log(res);
