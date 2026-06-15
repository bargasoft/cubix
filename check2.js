const fs = require('fs');
const lines = fs.readFileSync('temp.js', 'utf8').split('\n');
let stack = [];
for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    for(let j=0; j<l.length; j++) {
        if(l[j] === '{') stack.push(i+1);
        if(l[j] === '}') stack.pop();
    }
}
console.log('Unclosed braces at lines:', stack);
