const fs = require('fs');
const lines = fs.readFileSync('src/pages/TimetableManagementPage.jsx','utf8').split(/\r?\n/);
for (let i = 540; i < 760; i++) {
  console.log(`${i+1}: ${lines[i]}`);
}
