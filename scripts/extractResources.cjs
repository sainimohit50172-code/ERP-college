const fs = require('fs');
const path = require('path');

function walk(dir, exts = ['.js', '.jsx']){
  const results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if(stat && stat.isDirectory()){
      if(file === 'node_modules' || file === 'dist') return;
      results.push(...walk(filePath, exts));
    } else {
      if(exts.includes(path.extname(file))) results.push(filePath);
    }
  });
  return results;
}

function extractUsedResources(content){
  const pattern = /\b(?:useResourceList|useCreateResource|useUpdateResource|useDeleteResource|useSearchResource|useBulkImport|useBulkExport|useResourceDetails|useResource)\(\s*['\"]([^'\"]+)['\"]/g;
  const set = new Set();
  let m;
  while((m = pattern.exec(content)) !== null){
    set.add(m[1]);
  }
  return Array.from(set);
}

function extractEndpoints(content){
  const pattern = /(?:['\"])?([A-Za-z0-9_$-]+)(?:['\"])?\s*:\s*['\"]([^'\"]+)['\"]/g;
  const keys = new Set();
  const values = new Set();
  let m;
  while((m = pattern.exec(content)) !== null){
    keys.add(m[1]);
    values.add(m[2]);
  }
  return { keys: Array.from(keys), values: Array.from(values) };
}

function main(){
  const repoRoot = path.resolve(__dirname, '..');
  const srcDir = path.join(repoRoot, 'src');
  if(!fs.existsSync(srcDir)){
    console.error('src directory not found');
    process.exit(2);
  }
  const files = walk(srcDir);
  const used = new Set();
  files.forEach(f => {
    try{
      const c = fs.readFileSync(f, 'utf8');
      extractUsedResources(c).forEach(r => used.add(r));
    }catch(e){/*ignore*/}
  });
  const endpointsPath = path.join(srcDir, 'api', 'endpoints.js');
  let endpointsContent = '';
  if(fs.existsSync(endpointsPath)) endpointsContent = fs.readFileSync(endpointsPath, 'utf8');
  const endpoints = extractEndpoints(endpointsContent);

  const usedArr = Array.from(used).sort();
  const missing = usedArr.filter(r => !endpoints.keys.includes(r) && !endpoints.values.includes(r));

  const out = { usedResources: usedArr, endpointKeys: endpoints.keys.sort(), endpointValues: endpoints.values.sort(), missing };

  const outDir = path.join(repoRoot, '.out');
  if(!fs.existsSync(outDir)) fs.mkdirSync(outDir);
  fs.writeFileSync(path.join(outDir, 'resource-audit.json'), JSON.stringify(out, null, 2));

  console.log('RESOURCE_AUDIT_JSON_START');
  console.log(JSON.stringify(out));
  console.log('RESOURCE_AUDIT_JSON_END');
}

main();
