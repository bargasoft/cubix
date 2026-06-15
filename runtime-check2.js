const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const html = fs.readFileSync('www/index.html', 'utf8');
const virtualConsole = new jsdom.VirtualConsole();
virtualConsole.on("error", (err) => { console.error("Runtime Error:", err); });
virtualConsole.on("jsdomError", (err) => { console.error("JSDOM Error:", err); });
const dom = new JSDOM(html, { runScripts: "dangerously", resources: "usable", virtualConsole });
setTimeout(() => {
    try { dom.window.eval('updateProfileUI()'); console.log("updateProfileUI SUCCESS"); } catch(e) { console.error("updateProfileUI ERROR:", e); }
    try { dom.window.eval('updateShopUI()'); console.log("updateShopUI SUCCESS"); } catch(e) { console.error("updateShopUI ERROR:", e); }
    try { dom.window.eval('switchTab("HOME")'); console.log("switchTab HOME SUCCESS"); } catch(e) { console.error("switchTab HOME ERROR:", e); }
}, 1000);
