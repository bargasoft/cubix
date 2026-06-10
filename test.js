
        const scene = new THREE.Scene();
        scene.background = new THREE.Color('#f8f9fa');

        const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(10, 10, 10);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        document.body.appendChild(renderer.domElement);

        const controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true; 
        controls.enablePan = false;    

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
        scene.add(ambientLight);
        const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
        dirLight.position.set(10, 20, 10);
        scene.add(dirLight);

        function createCleanArrowTexture() {
            const canvas = document.createElement('canvas');
            canvas.width = 256; canvas.height = 256;
            const ctx = canvas.getContext('2d');
            
            ctx.fillStyle = 'rgba(0,0,0,0)';
            ctx.fillRect(0,0,256,256);
            
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 24;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            
            ctx.beginPath();
            ctx.moveTo(128, 200);
            ctx.lineTo(128, 80);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(70, 130);
            ctx.lineTo(128, 70);
            ctx.lineTo(186, 130);
            ctx.stroke();

            const tex = new THREE.CanvasTexture(canvas);
            tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
            return new THREE.MeshBasicMaterial({ map: tex, transparent: true });
        }

        const arrowMat = createCleanArrowTexture();

        const DIR_MATERIALS = {};
        const DIRS = [
            new THREE.Vector3(1,0,0), new THREE.Vector3(-1,0,0),
            new THREE.Vector3(0,1,0), new THREE.Vector3(0,-1,0),
            new THREE.Vector3(0,0,1), new THREE.Vector3(0,0,-1)
        ];

        DIR_MATERIALS['1,0,0'] = new THREE.MeshPhongMaterial({ color: 0xff6b6b, shininess: 60 });
        DIR_MATERIALS['-1,0,0'] = new THREE.MeshPhongMaterial({ color: 0xff9ff3, shininess: 60 });
        DIR_MATERIALS['0,1,0'] = new THREE.MeshPhongMaterial({ color: 0x48dbfb, shininess: 60 });
        DIR_MATERIALS['0,-1,0'] = new THREE.MeshPhongMaterial({ color: 0x1dd1a1, shininess: 60 });
        DIR_MATERIALS['0,0,1'] = new THREE.MeshPhongMaterial({ color: 0xfeca57, shininess: 60 });
        DIR_MATERIALS['0,0,-1'] = new THREE.MeshPhongMaterial({ color: 0x54a0ff, shininess: 60 });

        const planeGeo = new THREE.PlaneGeometry(0.85, 0.85);

        const mazeGroup = new THREE.Group();
        scene.add(mazeGroup);

        let blocks = [];
        let isLevelComplete = false;
        let level = parseInt(localStorage.getItem('arrowMaze_level')) || 1;
        document.getElementById('level-text').innerText = "Level " + level;
        
        let gold = parseInt(localStorage.getItem('arrowMaze_gold')) || 0;
        document.getElementById('gold-amount').innerText = gold;

        let unlockedShapes = JSON.parse(localStorage.getItem('arrowMaze_unlockedShapes')) || ['cube'];
        let currentShape = localStorage.getItem('arrowMaze_currentShape') || 'cube';
        
        const SHAPES = {
            'cube': { name: 'Klasik Küp', cost: 0, geo: new THREE.BoxGeometry(0.95, 0.95, 0.95) },
            'sphere': { name: 'Pürüzsüz Küre', cost: 1500, geo: new THREE.SphereGeometry(0.55, 32, 32) },
            'diamond': { name: 'Elmas Kesim', cost: 3500, geo: new THREE.OctahedronGeometry(0.65, 0) },
            'gem': { name: 'Kristal Cevher', cost: 6000, geo: new THREE.IcosahedronGeometry(0.65, 0) }
        };

        function updateShopUI() {
            document.getElementById('shop-gold-amount').innerText = gold;
            let container = document.getElementById('shop-items-container');
            container.innerHTML = '';
            
            Object.keys(SHAPES).forEach(key => {
                let item = SHAPES[key];
                let div = document.createElement('div');
                div.className = 'shop-item';
                
                let isUnlocked = unlockedShapes.includes(key);
                let isEquipped = (currentShape === key);
                
                let btnHtml = '';
                if (isEquipped) {
                    btnHtml = `<button class="shop-item-btn btn-equipped">Seçili</button>`;
                } else if (isUnlocked) {
                    btnHtml = `<button class="shop-item-btn btn-equip" onclick="equipShape('${key}')">Kullan</button>`;
                } else {
                    btnHtml = `<button class="shop-item-btn btn-buy" onclick="buyShape('${key}')">${item.cost} 🪙</button>`;
                }
                
                div.innerHTML = `<span class="shop-item-name">${item.name}</span> ${btnHtml}`;
                container.appendChild(div);
            });
        }
        
        window.buyShape = function(key) {
            let item = SHAPES[key];
            if (gold >= item.cost) {
                gold -= item.cost;
                unlockedShapes.push(key);
                localStorage.setItem('arrowMaze_gold', gold);
                localStorage.setItem('arrowMaze_unlockedShapes', JSON.stringify(unlockedShapes));
                document.getElementById('gold-amount').innerText = gold;
                SoundEngine.playCoin();
                equipShape(key);
            } else {
                SoundEngine.playStuck();
            }
        };
        
        window.equipShape = function(key) {
            currentShape = key;
            localStorage.setItem('arrowMaze_currentShape', currentShape);
            updateShopUI();
            SoundEngine.playFly();
            loadLevel();
        };
        
        document.getElementById('btn-shop').onclick = () => {
            updateShopUI();
            document.getElementById('shop-screen').style.display = 'flex';
        };
        document.getElementById('btn-close-shop').onclick = () => {
            document.getElementById('shop-screen').style.display = 'none';
        };

        const SoundEngine = (function() {
            let audioCtx = null;
            function init() {
                if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                if (audioCtx.state === 'suspended') audioCtx.resume();
            }
            function playTone(freq, type, duration, vol, slideFreq = null) {
                if (!audioCtx) return;
                let osc = audioCtx.createOscillator();
                let gainNode = audioCtx.createGain();
                osc.type = type;
                osc.connect(gainNode);
                gainNode.connect(audioCtx.destination);
                osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
                if (slideFreq) osc.frequency.exponentialRampToValueAtTime(slideFreq, audioCtx.currentTime + duration);
                gainNode.gain.setValueAtTime(vol, audioCtx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
                osc.start();
                osc.stop(audioCtx.currentTime + duration);
            }
            return {
                init: init,
                playFly: () => playTone(400, 'sine', 0.15, 0.2, 800),
                playStuck: () => playTone(150, 'square', 0.15, 0.1, 50),
                playCoin: () => {
                    playTone(1200, 'sine', 0.1, 0.1, 2000);
                    setTimeout(() => playTone(1600, 'sine', 0.15, 0.1), 50);
                },
                playVictory: () => {
                    setTimeout(() => playTone(440, 'sine', 0.2, 0.15), 0);
                    setTimeout(() => playTone(554, 'sine', 0.2, 0.15), 150);
                    setTimeout(() => playTone(659, 'sine', 0.3, 0.15), 300);
                    setTimeout(() => playTone(880, 'sine', 0.6, 0.2), 450);
                }
            };
        })();
        window.addEventListener('pointerdown', () => SoundEngine.init(), { once: true });

        const THEMES = [
            { bg: '#f8f9fa', text: '#1e272e', colors: [0xff6b6b, 0xff9ff3, 0x48dbfb, 0x1dd1a1, 0xfeca57, 0x54a0ff] },
            { bg: '#1e272e', text: '#f8f9fa', colors: [0xff3f34, 0xff3838, 0x0fb9b1, 0x20bf6b, 0xf7b731, 0x3867d6] },
            { bg: '#ffecd2', text: '#d35400', colors: [0xff7f50, 0xff6b81, 0x7bed9f, 0x2ed573, 0xffa502, 0x1e90ff] },
            { bg: '#e0fbfc', text: '#2d3436', colors: [0xee5253, 0xff9f43, 0x10ac84, 0x01a3a4, 0xfeca57, 0x2e86de] },
            { bg: '#2f3542', text: '#f1f2f6', colors: [0xff4757, 0xff6348, 0x2ed573, 0x1e90ff, 0xeccc68, 0x70a1ff] },
            { bg: '#f1e3d3', text: '#596275', colors: [0xc44569, 0xcf6a87, 0x3dc1d3, 0x546de5, 0xf3a683, 0xf7d794] },
        ];

        function getTier(lvl) {
            let currentLvl = 100, currentTier = 10, gap = 20;
            if (lvl <= 100) return Math.ceil(lvl / 10);
            while (lvl > currentLvl) {
                if (currentLvl >= 1000) gap = 100;
                else if (currentLvl >= 700) gap = 60;
                else if (currentLvl >= 500) gap = 50;
                else if (currentLvl >= 300) gap = 40;
                else if (currentLvl >= 200) gap = 30;
                if (lvl <= currentLvl + gap) return currentTier + 1;
                currentLvl += gap; currentTier++;
            }
            return currentTier;
        }

        function applyTheme(tier) {
            let theme = THEMES[(tier - 1) % THEMES.length];
            document.body.style.backgroundColor = theme.bg;
            scene.background = new THREE.Color(theme.bg);
            document.getElementById('level-text').style.color = theme.text;
            let keys = Object.keys(DIR_MATERIALS);
            for(let i=0; i<keys.length; i++) DIR_MATERIALS[keys[i]].color.setHex(theme.colors[i]);
        }

        function loadLevel() {
            isLevelComplete = false;
            blocks.forEach(b => mazeGroup.remove(b.group));
            blocks = [];
            let tier = getTier(level);
            applyTheme(tier);

            // Sonsuz Dinamik Zorluk Eğrisi (Katlanarak Artan)
            let size, blockCount;
            
            if (level === 1) { size = 2; blockCount = 6; }
            else if (level === 2) { size = 2; blockCount = 8; }
            else if (level === 3) { size = 3; blockCount = 15; }
            else {
                // Tier bazlı boyut ve yoğunluk (Limit yok!)
                size = 2 + Math.floor(tier / 2); // Tier 1->2, Tier 2->3, Tier 4->4, Tier 10->7, Tier 20->12 (Devasa!)
                let maxBlocks = size * size * size;
                let fillRatio = Math.min(0.4 + (tier * 0.03), 0.95); // Yoğunluk %95'e kadar çıkar
                blockCount = Math.floor(maxBlocks * fillRatio);
            }

            const offset = (size - 1) / 2;

            // Tersine Sökme (Reverse Assembly) Algoritması
            let grid = [];
            for(let x=0; x<size; x++) {
                for(let y=0; y<size; y++) {
                    for(let z=0; z<size; z++) {
                        grid.push(new THREE.Vector3(x, y, z));
                    }
                }
            }
            
            // İstenen blok sayısına kadar küçült
            while(grid.length > blockCount) {
                grid.splice(Math.floor(Math.random() * grid.length), 1);
            }

            let assignedBlocks = [];
            
            while(grid.length > 0) {
                let removable = [];
                for(let i=0; i<grid.length; i++) {
                    let b = grid[i];
                    let validDirs = [];
                    for(let dir of DIRS) {
                        let blocked = false;
                        for(let j=0; j<grid.length; j++) {
                            if (i === j) continue;
                            let other = grid[j];
                            if (dir.x !== 0 && other.y === b.y && other.z === b.z) {
                                if ((dir.x > 0 && other.x > b.x) || (dir.x < 0 && other.x < b.x)) blocked = true;
                            } else if (dir.y !== 0 && other.x === b.x && other.z === b.z) {
                                if ((dir.y > 0 && other.y > b.y) || (dir.y < 0 && other.y < b.y)) blocked = true;
                            } else if (dir.z !== 0 && other.x === b.x && other.y === b.y) {
                                if ((dir.z > 0 && other.z > b.z) || (dir.z < 0 && other.z < b.z)) blocked = true;
                            }
                        }
                        if (!blocked) validDirs.push(dir);
                    }
                    if (validDirs.length > 0) {
                        removable.push({ index: i, block: b, dirs: validDirs });
                    }
                }

                if (removable.length === 0) break;

                let picked = removable[Math.floor(Math.random() * removable.length)];
                let chosenDir = picked.dirs[Math.floor(Math.random() * picked.dirs.length)];

                assignedBlocks.push({ pos: picked.block, dir: chosenDir });
                grid.splice(picked.index, 1);
            }

            for(let item of assignedBlocks) {
                let pos = item.pos;
                let chosenDir = item.dir;
                
                let activeGeo = SHAPES[currentShape].geo;
                
                let group = new THREE.Group();
                let dirKey = `${chosenDir.x},${chosenDir.y},${chosenDir.z}`;
                let mesh = new THREE.Mesh(activeGeo, DIR_MATERIALS[dirKey]);
                
                let edges = new THREE.EdgesGeometry(activeGeo);
                // Çizgileri hafif beyazlaştırdık ki renklerin üstünde güzel dursun
                let line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0xffffff, opacity: 0.3, transparent: true }));
                mesh.add(line);
                
                group.add(mesh);

                // SİSTEMİ BOZMADAN DÜZELTME: Oklar tekrar eski haline (2D düz çizim) getirildi.
                // Mavi kutulardaki "oksuz kalma" sorununu çözmek için okları uçuş yönüne dik olan 
                // 4 YÜZEYE BİRDEN ekliyoruz. Böylece kutu nereden açığa çıkarsa çıksın oku her zaman görünür olacak.
                for(let n of DIRS) {
                    // Uçuş yönüne paralel olan (ön ve arka) yüzeylere ok konmaz.
                    if (Math.abs(n.dot(chosenDir)) > 0.1) continue;
                    
                    let plane = new THREE.Mesh(planeGeo, arrowMat);
                    plane.position.copy(n).multiplyScalar(0.476); 
                    plane.up.copy(chosenDir);
                    plane.lookAt(n.clone().multiplyScalar(2));
                    group.add(plane);
                }

                let basePos = new THREE.Vector3(pos.x - offset, pos.y - offset, pos.z - offset);
                group.position.copy(basePos);
                mazeGroup.add(group);
                
                let blockObj = {
                    group: group,
                    gridPos: pos.clone(),
                    basePos: basePos,
                    dir: chosenDir,
                    state: 'idle',
                    shakeTime: 0
                };
                
                group.children.forEach(c => c.userData.block = blockObj);
                mesh.userData.block = blockObj;
                line.userData.block = blockObj; 
                
                blocks.push(blockObj);
            }
        }

        loadLevel();

        const raycaster = new THREE.Raycaster();
        // HATA DÜZELTİLDİ: Three.js'de çizgilerin görünmez tıklama alanı devasadır. Yanlış kutuyu seçtiren buydu.
        raycaster.params.Line.threshold = 0.01; 
        const mouse = new THREE.Vector2();
        
        let downPos = {x:0, y:0};

        window.addEventListener('pointerdown', (e) => {
            downPos.x = e.clientX;
            downPos.y = e.clientY;
        });

        window.addEventListener('pointerup', (e) => {
            // HATA DÜZELTİLDİ: Sadece 15 pikselden az hareket edildiyse tıklama sayılır. 
            // Eskiden ufacık kaydırmalar bile sürükleme sayılıp bloklara tıklamayı bozuyordu.
            let dist = Math.hypot(e.clientX - downPos.x, e.clientY - downPos.y);
            if (dist < 15) { 
                mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
                mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
                
                raycaster.setFromCamera(mouse, camera);
                let intersects = raycaster.intersectObjects(blocks.map(b => b.group), true);

                // Sadece Mesh'leri (katı küp ve oklari) kabul et, devasa çizgi alanlarını yoksay
                intersects = intersects.filter(hit => hit.object.type !== 'LineSegments');

                if(intersects.length > 0) {
                    let clickedMesh = intersects[0].object;
                    if(!clickedMesh.userData.block && clickedMesh.parent && clickedMesh.parent.userData.block) {
                        clickedMesh = clickedMesh.parent;
                    }
                    let b = clickedMesh.userData.block;
                    if(b && b.state === 'idle') {
                        checkAndMove(b);
                    }
                }
            }
        });

        function checkAndMove(b) {
            let canMove = true;
            for(let other of blocks) {
                if(other === b || other.state === 'flying') continue;
                
                let dir = b.dir;
                if (dir.x !== 0 && other.gridPos.y === b.gridPos.y && other.gridPos.z === b.gridPos.z) {
                    if ((dir.x > 0 && other.gridPos.x > b.gridPos.x) || (dir.x < 0 && other.gridPos.x < b.gridPos.x)) canMove = false;
                } else if (dir.y !== 0 && other.gridPos.x === b.gridPos.x && other.gridPos.z === b.gridPos.z) {
                    if ((dir.y > 0 && other.gridPos.y > b.gridPos.y) || (dir.y < 0 && other.gridPos.y < b.gridPos.y)) canMove = false;
                } else if (dir.z !== 0 && other.gridPos.x === b.gridPos.x && other.gridPos.y === b.gridPos.y) {
                    if ((dir.z > 0 && other.gridPos.z > b.gridPos.z) || (dir.z < 0 && other.gridPos.z < b.gridPos.z)) canMove = false;
                }
            }

            if(canMove) {
                b.state = 'flying';
                if(typeof SoundEngine !== 'undefined') SoundEngine.playFly();
            } else {
                b.state = 'shaking';
                b.shakeTime = 15;
                if(typeof SoundEngine !== 'undefined') SoundEngine.playStuck();
            }
        }

        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });

        function animate() {
            requestAnimationFrame(animate);
            ParticleEngine.update();

            // AFK / Idle Animasyonu (Nefes Alma ve Süzülme)
            let idleTime = Date.now() - lastInteractionTime;
            if (idleTime > 3000 && !isLevelComplete && blocks.length > 0) {
                let t = (idleTime - 3000) * 0.0005;
                mazeGroup.rotation.y = Math.sin(t * 0.8) * 0.5; // Sağa sola dönüş
                mazeGroup.rotation.x = Math.sin(t * 0.5) * 0.3; // Aşağı yukarı eğilme
                mazeGroup.rotation.z = Math.cos(t * 0.6) * 0.15; // Hafif beşik hareketi
            } else {
                // Etkileşim anında pürüzsüzce (smooth) eski düz açısına kilitlen
                mazeGroup.rotation.y += (0 - mazeGroup.rotation.y) * 0.15;
                mazeGroup.rotation.x += (0 - mazeGroup.rotation.x) * 0.15;
                mazeGroup.rotation.z += (0 - mazeGroup.rotation.z) * 0.15;
            }

            // Kutuların Uçuş Animasyonu
            for (let i = blocks.length - 1; i >= 0; i--) {
                let b = blocks[i];
                if (b.state === 'flying') {
                    b.group.position.add(b.dir.clone().multiplyScalar(0.5));
                    if (b.group.position.length() > 15) {
                        let worldPos = new THREE.Vector3();
                        b.group.getWorldPosition(worldPos);
                        let dirStr = `${b.dir.x},${b.dir.y},${b.dir.z}`;
                        let colorHex = DIR_MATERIALS[dirStr] ? DIR_MATERIALS[dirStr].color.getHex() : 0xffffff;
                        ParticleEngine.spawnBurst(worldPos, colorHex);
                        
                        mazeGroup.remove(b.group);
                        blocks.splice(i, 1);
                    }
                } else if(b.state === 'shaking') {
                    b.shakeTime--;
                    let shakeAmt = (b.shakeTime % 4 < 2) ? 0.1 : -0.1;
                    b.group.position.copy(b.basePos).add(b.dir.clone().multiplyScalar(shakeAmt));
                    if(b.shakeTime <= 0) {
                        b.state = 'idle';
                        b.group.position.copy(b.basePos);
                    }
                }
            }

            if(blocks.length === 0 && !isLevelComplete) {
                isLevelComplete = true;
                SoundEngine.playVictory();
                ParticleEngine.spawnGoldConfetti();
                
                // Temel Altın Kazanımı
                let baseGold = 15 + Math.floor(Math.random() * 15) + (getTier(level) * 5); 
                
                let victoryScreen = document.getElementById('victory-screen');
                let goldAmountText = document.getElementById('victory-gold-amount');
                let slider = document.getElementById('multiplier-slider');
                let btnMultiply = document.getElementById('btn-multiply');
                let btnClaim = document.getElementById('btn-claim');
                let multText = document.getElementById('multiplier-text');
                
                goldAmountText.innerText = baseGold;
                goldAmountText.style.color = "#f1c40f"; // Reset color
                victoryScreen.classList.add('show');
                
                // Animasyon Değişkenleri
                let isAnimating = true;
                let sliderPos = 0; // 0 to 100
                let sliderDir = 1;
                let speed = 1.8; // İbre hızı dengelendi (Eski değer: 1.2, İlk değer: 2.5)
                
                function updateSlider() {
                    if (!isAnimating) return;
                    sliderPos += sliderDir * speed;
                    if (sliderPos > 100) { sliderPos = 100; sliderDir = -1; }
                    if (sliderPos < 0) { sliderPos = 0; sliderDir = 1; }
                    
                    slider.style.left = sliderPos + '%';
                    
                    // Hangi bölgede (zone) olduğunu hesapla
                    let currentMult = 2;
                    if (sliderPos >= 20 && sliderPos <= 80) {
                        currentMult = 3;
                        if (sliderPos >= 40 && sliderPos <= 60) currentMult = 5;
                    }
                    multText.innerText = "x" + currentMult;
                    
                    requestAnimationFrame(updateSlider);
                }
                updateSlider();
                
                function proceedToNextLevel(finalGold) {
                    isAnimating = false;
                    victoryScreen.classList.remove('show');
                    
                    gold += finalGold;
                    localStorage.setItem('arrowMaze_gold', gold);
                    document.getElementById('gold-text').innerText = gold;

                    level++;
                    localStorage.setItem('arrowMaze_level', level);
                    document.getElementById('level-text').innerText = "Level " + level;
                    
                    // Memory leak önleme
                    btnMultiply.onclick = null;
                    btnClaim.onclick = null;
                    
                    setTimeout(loadLevel, 500); 
                }

                btnMultiply.onclick = () => {
                    if(!isAnimating) return; // Prevent double click
                    isAnimating = false;
                    SoundEngine.playCoin();
                    
                    let mult = parseInt(multText.innerText.replace('x', ''));
                    let finalGold = baseGold * mult;
                    
                    if (mult >= 3) ParticleEngine.spawnGoldConfetti(); // 3x ve 5x tutturunca ekstra konfeti!
                    
                    // Görsel kutlama efekti
                    goldAmountText.innerText = finalGold + " (" + mult + "X!)";
                    goldAmountText.style.color = "#ff7675";
                    
                    // İleride buraya reklam API'si entegre edilecek.
                    // Şimdilik 1.5 saniye sonra geçiş yapıyoruz.
                    setTimeout(() => proceedToNextLevel(finalGold), 1500);
                };
                
                btnClaim.onclick = () => {
                    if(!isAnimating) return;
                    SoundEngine.playCoin();
                    proceedToNextLevel(baseGold);
                };
            }

            renderer.render(scene, camera);
        }
        animate();
    