const fs = require('fs');
let html = fs.readFileSync('www/index.html', 'utf8');
html = html.replace(/console\.error/g, 'console.warn');
fs.writeFileSync('www/index.html', html, 'utf8');
console.log('console.error replaced with console.warn');
