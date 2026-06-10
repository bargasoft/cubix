const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const html = fs.readFileSync('index.html', 'utf8');
const dom = new JSDOM(html, { runScripts: "dangerously" });
const window = dom.window;

setTimeout(() => {
    const THREE = window.THREE;
    let q = new THREE.Quaternion();
    let v1 = new THREE.Vector3(0,1,0);
    let v2 = new THREE.Vector3(0,-1,0);
    q.setFromUnitVectors(v1, v2);
    console.log("Quaternion:", q);
}, 1000);
