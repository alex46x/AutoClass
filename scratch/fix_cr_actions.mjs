import fs from 'fs';

const path = 'app/actions/cr.ts';
let content = fs.readFileSync(path, 'utf8');

// Replace semester/section strings with semesterId/sectionId
content = content.replace(/crUser\.semester/g, 'crUser.semesterId');
content = content.replace(/crUser\.section/g, 'crUser.sectionId');
content = content.replace(/users\.semester/g, 'users.semesterId');
content = content.replace(/users\.section/g, 'users.sectionId');

// Fix || '' which becomes || 0
content = content.replace(/\|\| ''/g, '|| 0');

// Fix getCRDashboardStats specifically
content = content.replace(
  /const semesterId = crUser\.semesterId \|\| 0;\n  const sectionId = crUser\.sectionId \|\| 0;/,
  `const semesterId = crUser.semesterId || 0;
  const sectionId = crUser.sectionId || 0;`
);

// We should properly handle null vs 0
// Actually, let's just make a more precise replace to handle semesterId and sectionId correctly

fs.writeFileSync(path, content);
console.log('CR Actions fixed!');
