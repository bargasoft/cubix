const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const path = require('path');

const html = fs.readFileSync('index.html', 'utf8');

const dom = new JSDOM(html, { 
    runScripts: "outside-only", 
    resources: "usable",
    url: "file://" + path.join(__dirname, "index.html")
});

const window = dom.window;

// Mock WebGL
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
    try {
        const scripts = window.document.querySelectorAll('script');
        for (let script of scripts) {
            if (script.textContent) {
                window.eval(script.textContent);
            }
        }
        
        const THREE = window.THREE;
        if (!THREE) {
            console.error("THREE not loaded");
            return;
        }

        const DIRS = [
            new THREE.Vector3(1,0,0), new THREE.Vector3(-1,0,0),
            new THREE.Vector3(0,1,0), new THREE.Vector3(0,-1,0),
            new THREE.Vector3(0,0,1), new THREE.Vector3(0,0,-1)
        ];

        let geo = new THREE.OctahedronGeometry(0.48, 0);
        
        // Inline the getGeometryFaces function from index.html
        let posAttr = geo.attributes.position;
        let index = geo.index;
        let faces = [];
        if (index) {
            for(let i=0; i<index.count; i+=3) {
                let a = new THREE.Vector3().fromBufferAttribute(posAttr, index.getX(i));
                let b = new THREE.Vector3().fromBufferAttribute(posAttr, index.getX(i+1));
                let c = new THREE.Vector3().fromBufferAttribute(posAttr, index.getX(i+2));
                let center = new THREE.Vector3().addVectors(a, b).add(c).divideScalar(3);
                let ab = new THREE.Vector3().subVectors(b, a);
                let ac = new THREE.Vector3().subVectors(c, a);
                let normal = new THREE.Vector3().crossVectors(ab, ac).normalize();
                if (normal.dot(center) < 0) normal.negate();
                faces.push({ center, normal });
            }
        } else {
            for(let i=0; i<posAttr.count; i+=3) {
                let a = new THREE.Vector3().fromBufferAttribute(posAttr, i);
                let b = new THREE.Vector3().fromBufferAttribute(posAttr, i+1);
                let c = new THREE.Vector3().fromBufferAttribute(posAttr, i+2);
                let center = new THREE.Vector3().addVectors(a, b).add(c).divideScalar(3);
                let ab = new THREE.Vector3().subVectors(b, a);
                let ac = new THREE.Vector3().subVectors(c, a);
                let normal = new THREE.Vector3().crossVectors(ab, ac).normalize();
                if (normal.dot(center) < 0) normal.negate();
                faces.push({ center, normal });
            }
        }
        
        let uniqueFaces = [];
        for(let f of faces) {
            let isDup = uniqueFaces.some(uf => uf.center.distanceToSquared(f.center) < 0.0001);
            if (!isDup) uniqueFaces.push(f);
        }
        faces = uniqueFaces;

        console.log("Octahedron unique faces: " + faces.length);

        let chosenDir = new THREE.Vector3(1, 0, 0);
        let pickedFaces = [];
        
        let facesCopy = faces.slice();
        for(let n of DIRS) {
            if (Math.abs(n.dot(chosenDir)) > 0.1) continue; 
            
            let bestFace = null;
            let bestScore = -Infinity;
            let bestIdx = -1;
            
            for(let i=0; i<facesCopy.length; i++) {
                let face = facesCopy[i];
                let score = face.normal.dot(n) - Math.abs(face.normal.dot(chosenDir));
                if (score > bestScore) {
                    bestScore = score;
                    bestFace = face;
                    bestIdx = i;
                }
            }
            
            if (bestFace) {
                pickedFaces.push({ortho: n.toArray(), face: bestFace});
                facesCopy.splice(bestIdx, 1);
            }
        }

        console.log("Picked Faces for +X movement:");
        for(let p of pickedFaces) {
            let normal = p.face.normal;
            let projectedDir = chosenDir.clone().sub(normal.clone().multiplyScalar(chosenDir.dot(normal))).normalize();
            console.log(`Ortho: ${p.ortho} -> Normal: [${normal.x.toFixed(2)}, ${normal.y.toFixed(2)}, ${normal.z.toFixed(2)}] -> ProjectedDir: [${projectedDir.x.toFixed(2)}, ${projectedDir.y.toFixed(2)}, ${projectedDir.z.toFixed(2)}]`);
        }

    } catch(e) {
        console.error("Test Error:", e);
    }
}, 1000);
