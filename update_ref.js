const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /slashBassDegree,/,
  "slashBassDegree,\n    activeSlashBassKeys: [] as number[],"
);

fs.writeFileSync('src/App.tsx', code);
