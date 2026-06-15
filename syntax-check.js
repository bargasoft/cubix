const fs = require('fs');
const html = fs.readFileSync('www/index.html', 'utf8');
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
if (scriptMatch) {
    fs.writeFileSync('temp.js', scriptMatch[1]);
    console.log("Extracted temp.js");
} else {
    console.log("No script found");
}
