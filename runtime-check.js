const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const html = fs.readFileSync('www/index.html', 'utf8');

const virtualConsole = new jsdom.VirtualConsole();
virtualConsole.on("error", (err) => { console.error("Runtime Error:", err); });
virtualConsole.on("warn", (warn) => { console.warn("Runtime Warn:", warn); });
virtualConsole.on("log", (log) => { console.log("Runtime Log:", log); });
virtualConsole.on("jsdomError", (err) => { console.error("JSDOM Error:", err); });

const dom = new JSDOM(html, {
    runScripts: "dangerously",
    resources: "usable",
    virtualConsole
});
