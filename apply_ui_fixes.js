const fs = require('fs');
let html = fs.readFileSync('www/index.html', 'utf8');

// 1. Update Profile tab icon ID
html = html.replace(
    /<div class="nav-icon">👤<\/div>\s*<div class="nav-text">Profil<\/div>/,
    `<div class="nav-icon" id="nav-profile-icon">👤</div>\n                <div class="nav-text">Profil</div>`
);

// 2. Change Avatar Modal HTML
html = html.replace(
    /<div class="profile-card" id="avatar-selection-card" style="display: none;">[\s\S]*?<\/div>\s*<\/div>\s*<div id="settings-screen">/,
    `<div id="avatar-selection-card" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); backdrop-filter: blur(5px); z-index: 200; flex-direction: column; justify-content: center; align-items: center;">
            <div style="background: white; padding: 25px; border-radius: 20px; width: 90%; max-width: 350px; text-align: center; box-shadow: 0 20px 50px rgba(0,0,0,0.2); max-height: 80vh; overflow-y: auto;">
                <h3 style="margin-top:0; color:#2d3436;">Avatar Seçimi</h3>
                <div id="avatar-list" class="avatar-grid"></div>
                <button onclick="closeAvatarSelection()" style="margin-top: 20px; padding: 12px 20px; font-weight: bold; background: #dfe6e9; border: none; border-radius: 12px; cursor: pointer; color: #2d3436; width: 100%;">Kapat</button>
            </div>
        </div>
        </div>
        <div id="settings-screen">`
);

// 3. Remove Ads Watched from Profile, update Title
html = html.replace(
    /<h2 style="margin: 0 0 15px 0; color: #2d3436;">Oyuncu<\/h2>/,
    `<h2 id="profile-name" style="margin: 0 0 15px 0; color: #2d3436;">Oyuncu</h2>`
);
html = html.replace(
    /<div class="stat-row">\s*<span>📺 İzlenen Reklam<\/span>\s*<span id="stat-ads">0<\/span>\s*<\/div>/,
    ``
);

// 4. Add Player Name Input to Settings
html = html.replace(
    /<h1 style="margin-top:0; color:#2d3436; font-size:22px;">Ayarlar ⚙️<\/h1>/,
    `<h1 style="margin-top:0; color:#2d3436; font-size:22px;">Ayarlar ⚙️</h1>
                <div class="shop-item" style="flex-direction: column; align-items: stretch; gap: 10px; margin-bottom: 15px;">
                    <span class="shop-item-name" style="text-align:left;">Oyuncu Adı</span>
                    <div style="display:flex; gap:10px;">
                        <input type="text" id="input-player-name" placeholder="Adınız" style="flex:1; padding: 8px; border: 1px solid #dfe6e9; border-radius: 8px; font-weight: bold;" maxlength="15">
                        <button class="shop-item-btn" style="background:#0984e3; color:white;" onclick="savePlayerName()">KAYDET</button>
                    </div>
                </div>`
);

// 5. Update AVATARS Object & State
html = html.replace(
    /const AVATARS = \{[\s\S]*?\};\s*let unlockedAvatars = JSON\.parse\(localStorage\.getItem\('arrowMaze_unlockedAvatars'\)\) \|\| \['free1', 'free2', 'free3', 'free4'\];\s*let currentAvatar = localStorage\.getItem\('arrowMaze_currentAvatar'\) \|\| 'free1';/,
    `const AVATARS = {
            'default': { icon: '😎', price: 0, isPremium: false },
            'free1': { icon: '🤖', price: 0, isPremium: false },
            'free2': { icon: '👽', price: 0, isPremium: false },
            'gold1': { icon: '👻', price: 10000, isPremium: false },
            'gold2': { icon: '👾', price: 25000, isPremium: false },
            'gold3': { icon: '🦁', price: 50000, isPremium: false },
            'gold4': { icon: '👑', price: 100000, isPremium: false },
            'prime1': { icon: '💎', price: 0, isPremium: true },
            'prime2': { icon: '🚀', price: 0, isPremium: true },
            'prime3': { icon: '🔥', price: 0, isPremium: true }
        };
        let unlockedAvatars = JSON.parse(localStorage.getItem('arrowMaze_unlockedAvatars')) || ['default', 'free1', 'free2'];
        let currentAvatar = localStorage.getItem('arrowMaze_currentAvatar') || 'default';
        let playerName = localStorage.getItem('cubix_playerName') || localStorage.getItem('arrowMaze_playerName') || "Oyuncu";
        
        window.savePlayerName = function() {
            let val = document.getElementById('input-player-name').value.trim();
            if(val) {
                playerName = val;
                localStorage.setItem('cubix_playerName', playerName);
                let pn = document.getElementById('profile-name');
                if(pn) pn.innerText = playerName;
                SoundEngine.playCoin();
            }
        };`
);

// 6. Update Shop UI (Market Categories)
html = html.replace(
    /function updateShopUI\(\) \{[\s\S]*?window\.buyShape/m,
    `function updateShopUI() {
            let hudGold = document.getElementById('hud-gold-amount');
            if (hudGold) hudGold.innerText = gold;
            
            let adsWatchedCount = parseInt(localStorage.getItem('arrowMaze_adsWatchedCount')) || 0;
            let currentReward = 250;
            if (adsWatchedCount % 3 === 1) currentReward = 650;
            if (adsWatchedCount % 3 === 2) currentReward = 1200;

            let container = document.getElementById('shop-items-container');
            container.innerHTML = \`
                <div style="background: rgba(255, 255, 255, 0.9); padding: 15px; border-radius: 16px; margin-bottom: 20px; text-align: center; box-shadow: 0 4px 15px rgba(0,0,0,0.1); width: 90%; max-width: 400px;">
                    <h3 style="margin: 0 0 10px 0; color: #2d3436;">Altın Kazan</h3>
                    <button id="btn-ad-gold" onclick="watchAdForGold()" style="padding: 12px 25px; font-size: 16px; font-weight: bold; background: linear-gradient(45deg, #0984e3, #74b9ff); color: white; border: none; border-radius: 12px; cursor: pointer; box-shadow: 0 4px 10px rgba(9, 132, 227, 0.4); width: 100%;">📺 Reklam İzle (+\${currentReward} 🪙)</button>
                </div>
                <div style="width: 90%; max-width: 400px;">
                    <h3 style="color:#2d3436; margin-bottom: 10px;">Kategoriler</h3>
                    <div class="shop-item" onclick="showShopCategory('cubes')" style="cursor:pointer; background:#fff; border-left: 4px solid #0984e3;">
                        <span class="shop-item-name" style="font-size:18px;">🧊 Küpler</span>
                        <span style="font-size:20px;">➔</span>
                    </div>
                    <div class="shop-item" onclick="openAvatarSelection()" style="cursor:pointer; background:#fff; border-left: 4px solid #f1c40f;">
                        <span class="shop-item-name" style="font-size:18px;">😎 Avatarlar</span>
                        <span style="font-size:20px;">➔</span>
                    </div>
                    <div class="shop-item" style="opacity: 0.6; background:#f1f2f6; cursor:default;">
                        <span class="shop-item-name" style="font-size:18px;">🖼️ Temalar</span>
                        <span style="font-size:14px; color:#e74c3c; font-weight:bold;">Yakında</span>
                    </div>
                    <div class="shop-item" style="opacity: 0.6; background:#f1f2f6; cursor:default;">
                        <span class="shop-item-name" style="font-size:18px;">✨ Efektler</span>
                        <span style="font-size:14px; color:#e74c3c; font-weight:bold;">Yakında</span>
                    </div>
                    <div class="shop-item" style="opacity: 0.6; background:#f1f2f6; cursor:default;">
                        <span class="shop-item-name" style="font-size:18px;">💎 Prime</span>
                        <span style="font-size:14px; color:#e74c3c; font-weight:bold;">Yakında</span>
                    </div>
                </div>
            \`;
        }
        
        window.showShopCategory = function(type) {
            if(type === 'cubes') {
                let container = document.getElementById('shop-items-container');
                let html = \`
                    <div style="width: 90%; max-width: 400px; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center;">
                        <h3 style="margin:0; color:#2d3436;">🧊 Küpler</h3>
                        <button onclick="updateShopUI()" style="padding: 8px 15px; background: #dfe6e9; border: none; border-radius: 8px; font-weight: bold; cursor: pointer;">Geri</button>
                    </div>
                \`;
                Object.keys(SHAPES).forEach(key => {
                    let item = SHAPES[key];
                    let isUnlocked = unlockedShapes.includes(key);
                    let isEquipped = (currentShape === key);
                    let btnHtml = '';
                    if (isEquipped) {
                        btnHtml = \`<button class="shop-item-btn btn-equipped">Seçili</button>\`;
                    } else if (isUnlocked) {
                        btnHtml = \`<button class="shop-item-btn btn-equip" onclick="equipShape('\${key}')">Kullan</button>\`;
                    } else {
                        let btnStyle = (gold >= item.cost) ? "" : "opacity:0.6;";
                        btnHtml = \`<button class="shop-item-btn btn-buy" style="\${btnStyle}" onclick="buyShape('\${key}', this)">\${item.cost} 🪙</button>\`;
                    }
                    html += \`<div class="shop-item"><span class="shop-item-name">\${item.name}</span> \${btnHtml}</div>\`;
                });
                container.innerHTML = html;
            }
        };
        
        window.buyShape`
);

// 7. Update Avatar Selection Functions
html = html.replace(
    /function openAvatarSelection\(\) \{[\s\S]*?function closeAvatarSelection\(\) \{[\s\S]*?\}/,
    `function openAvatarSelection() {
            document.getElementById('avatar-selection-card').style.display = 'flex';
            let container = document.getElementById('avatar-list');
            container.innerHTML = '';
            Object.keys(AVATARS).forEach(key => {
                let av = AVATARS[key];
                let isUnlocked = unlockedAvatars.includes(key);
                let isSelected = (currentAvatar === key);
                
                let div = document.createElement('div');
                div.className = 'avatar-item' + (isSelected ? ' active' : '');
                let html = \`<div class="avatar-item-icon">\${av.icon}</div>\`;
                
                if (av.isPremium) {
                    html += \`<div class="avatar-item-price" style="color:#8e44ad;">Yakında</div>\`;
                } else if (!isUnlocked) {
                    html += \`<div class="avatar-item-price">\${av.price} 🪙</div>\`;
                } else if (isSelected) {
                    html += \`<div class="avatar-item-price" style="color:#27ae60;">Seçili</div>\`;
                } else {
                    html += \`<div class="avatar-item-price" style="color:#2980b9;">Açık</div>\`;
                }
                
                div.innerHTML = html;
                div.onclick = () => {
                    if(av.isPremium) {
                        if(typeof SoundEngine !== 'undefined') SoundEngine.playStuck();
                        return;
                    }
                    if(isUnlocked) {
                        currentAvatar = key;
                        localStorage.setItem('arrowMaze_currentAvatar', currentAvatar);
                        let profileAvatar = document.getElementById('current-avatar-icon');
                        if(profileAvatar) profileAvatar.innerText = av.icon;
                        let navProfileIcon = document.getElementById('nav-profile-icon');
                        if(navProfileIcon) navProfileIcon.innerText = av.icon;
                        if(typeof SoundEngine !== 'undefined') SoundEngine.playFly();
                        openAvatarSelection(); 
                        updateProfileUI(); 
                    } else {
                        if(gold >= av.price) {
                            gold -= av.price;
                            localStorage.setItem('arrowMaze_gold', gold);
                            unlockedAvatars.push(key);
                            localStorage.setItem('arrowMaze_unlockedAvatars', JSON.stringify(unlockedAvatars));
                            currentAvatar = key;
                            localStorage.setItem('arrowMaze_currentAvatar', currentAvatar);
                            let profileAvatar = document.getElementById('current-avatar-icon');
                            if(profileAvatar) profileAvatar.innerText = av.icon;
                            let navProfileIcon = document.getElementById('nav-profile-icon');
                            if(navProfileIcon) navProfileIcon.innerText = av.icon;
                            if(typeof SoundEngine !== 'undefined') SoundEngine.playCoin();
                            openAvatarSelection();
                            updateProfileUI();
                            
                            let hudGold = document.getElementById('hud-gold-amount');
                            if(hudGold) hudGold.innerText = gold;
                        } else {
                            if(typeof SoundEngine !== 'undefined') SoundEngine.playStuck();
                            let priceEl = div.querySelector('.avatar-item-price');
                            if(priceEl) {
                                let oldText = priceEl.innerText;
                                priceEl.innerText = "Yetersiz!";
                                priceEl.style.color = "#e74c3c";
                                setTimeout(()=> { priceEl.innerText = oldText; priceEl.style.color = "#d63031"; }, 1000);
                            }
                        }
                    }
                };
                container.appendChild(div);
            });
        }

        function closeAvatarSelection() {
            document.getElementById('avatar-selection-card').style.display = 'none';
        }`
);

// 8. Update Profile UI to populate Player Name & Remove ads from calculation if needed (wait, UI is already updated to remove the row, just update what remains)
// Let's modify `updateProfileUI`
html = html.replace(
    /function updateProfileUI\(\) \{[\s\S]*?let statShapes = document\.getElementById\('stat-shapes'\);/m,
    `function updateProfileUI() {
            let av = AVATARS[currentAvatar];
            let profileAvatar = document.getElementById('current-avatar-icon');
            if(profileAvatar && av) profileAvatar.innerText = av.icon;
            
            let pn = document.getElementById('profile-name');
            if(pn) pn.innerText = playerName;

            let statGames = document.getElementById('stat-games');
            if (statGames) statGames.innerText = localStorage.getItem('arrowMaze_gamesPlayed') || 0;

            let statLevel = document.getElementById('stat-level');
            if (statLevel) statLevel.innerText = localStorage.getItem('arrowMaze_maxLevel') || 1;

            let statGold = document.getElementById('stat-gold');
            if (statGold) statGold.innerText = localStorage.getItem('arrowMaze_totalGoldEarned') || 0;

            let statShapes = document.getElementById('stat-shapes');`
);

// 9. Update openSettings to populate player name
html = html.replace(
    /function openSettings\(\) \{/,
    `function openSettings() {
            let pnInput = document.getElementById('input-player-name');
            if(pnInput) pnInput.value = playerName;`
);

// 10. Also run a small initializer for nav icon on load
html = html.replace(
    /let initialGoldEl = document\.getElementById\('hud-gold-amount'\);/,
    `let initialGoldEl = document.getElementById('hud-gold-amount');
        setTimeout(() => {
            let avInit = AVATARS[currentAvatar];
            if(avInit) {
                let navProfileIcon = document.getElementById('nav-profile-icon');
                if(navProfileIcon) navProfileIcon.innerText = avInit.icon;
                let profileAvatar = document.getElementById('current-avatar-icon');
                if(profileAvatar) profileAvatar.innerText = avInit.icon;
            }
        }, 500);`
);


fs.writeFileSync('www/index.html', html, 'utf8');
console.log('UI Fixes Applied!');
