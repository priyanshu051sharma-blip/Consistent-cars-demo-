const fs = require('fs');
fs.writeFileSync('.env', 'DATABASE_URL="file:./dev.db"');
console.log('.env created');
