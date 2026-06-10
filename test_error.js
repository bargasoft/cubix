const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const html = fs.readFileSync('index.html', 'utf8');

const virtualConsole = new jsdom.VirtualConsole();
virtualConsole.on("error", (err) => {
  console.error("JSDOM Error:", err.message, err.stack);
});
virtualConsole.on("jsdomError", (err) => {
  console.error("JSDOM Internal Error:", err.message, err.stack);
});
virtualConsole.on("log", (msg) => {
  console.log("JSDOM Log:", msg);
});

const dom = new JSDOM(html, { 
    runScripts: "dangerously", 
    resources: "usable",
    virtualConsole 
});
