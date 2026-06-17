const fs = require('fs');
let html = fs.readFileSync('www/index.html', 'utf8');

html = html.replace('#gold-modal > div', '#gold-reward-modal > div');

fs.writeFileSync('www/index.html', html, 'utf8');
console.log('Fixed gold-reward-modal CSS selector.');
