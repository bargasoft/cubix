const fs = require('fs');
const lines = fs.readFileSync('temp.js', 'utf8').split('\n');
let c = 0;
for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    c += (l.match(/\{/g) || []).length;
    c -= (l.match(/\}/g) || []).length;
    if (l.includes('function ')) {
        console.log(`${i+1}: ${c} : ${l.trim()}`);
    }
}
console.log('Final brace count:', c);
