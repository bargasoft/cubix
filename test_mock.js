const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const path = require('path');

const html = fs.readFileSync('index.html', 'utf8');

const virtualConsole = new jsdom.VirtualConsole();
virtualConsole.on("error", (err) => {
  console.error("JSDOM Error:", err);
});
virtualConsole.on("jsdomError", (err) => {
  console.error("JSDOM Internal Error:", err.message, err.detail);
});
virtualConsole.on("log", (msg) => {
  console.log("JSDOM Log:", msg);
});

const dom = new JSDOM(html, { 
    runScripts: "dangerously", 
    resources: "usable",
    virtualConsole,
    url: "file://" + path.join(__dirname, "index.html")
});

const window = dom.window;

window.HTMLCanvasElement.prototype.getContext = function(type) {
    if (type === 'webgl' || type === 'webgl2' || type === 'experimental-webgl') {
        return {
            getExtension: () => null,
            getParameter: () => 1,
            clearColor: () => {},
            enable: () => {},
            depthFunc: () => {},
            blendFunc: () => {},
            clear: () => {},
            createBuffer: () => ({}),
            bindBuffer: () => {},
            bufferData: () => {},
            createShader: () => ({}),
            shaderSource: () => {},
            compileShader: () => {},
            getShaderParameter: () => 1,
            createProgram: () => ({}),
            attachShader: () => {},
            linkProgram: () => {},
            getProgramParameter: () => 1,
            useProgram: () => {},
            getAttribLocation: () => 0,
            enableVertexAttribArray: () => {},
            vertexAttribPointer: () => {},
            drawArrays: () => {},
            drawElements: () => {},
            canvas: this,
            isContextLost: () => false
        };
    }
    return {
        fillRect: () => {},
        clearRect: () => {},
        getImageData: () => ({ data: new Uint8Array(4) }),
        putImageData: () => {},
        createImageData: () => ({}),
        setTransform: () => {},
        drawImage: () => {},
        save: () => {},
        fillText: () => {},
        restore: () => {},
        beginPath: () => {},
        moveTo: () => {},
        lineTo: () => {},
        closePath: () => {},
        stroke: () => {},
        fill: () => {},
        arc: () => {},
        measureText: () => ({ width: 0 }),
        canvas: this
    };
};

setTimeout(() => {
    console.log("Finished running");
}, 3000);
