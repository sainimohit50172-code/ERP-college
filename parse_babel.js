const fs = require('fs');
const parser = require('@babel/parser');
const code = fs.readFileSync('src/pages/TimetableManagementPage.jsx','utf8');
try {
  parser.parse(code, {sourceType:'module', plugins:['jsx','classProperties','optionalChaining','nullishCoalescingOperator']});
  console.log('parsed ok');
} catch(e) {
  console.error(e.message);
  console.error('loc', JSON.stringify(e.loc));
  process.exit(1);
}
