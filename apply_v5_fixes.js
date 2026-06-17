const fs = require('fs');
let html = fs.readFileSync('www/index.html', 'utf8');

// 1. Level Grid Size Logic
let getLevelSizeScript = `let size;
            if (level <= 5) size = 2;
            else if (level <= 15) size = 3;
            else if (level <= 35) size = 4;
            else if (level <= 70) size = 5;
            else if (level <= 120) size = 6;
            else size = 7;`;
html = html.replace(/let size = 2 \+ Math\.floor\(\(level - 1\) \/ 5\);/g, getLevelSizeScript);

// 2. Time Logic
let oldTimeLogic = `let timeLimit = Math.max(25, Math.floor(blocks.length * 1.2));
            if(level <= 2) timeLimit = 60; // İlk 2 bölüm için ekstra zaman`;
let newTimeLogic = `let timeMultiplier = 0.9;
            if (level <= 10) timeMultiplier = 1.45;
            else if (level <= 30) timeMultiplier = 1.30;
            else if (level <= 70) timeMultiplier = 1.15;
            else if (level <= 120) timeMultiplier = 1.0;

            let timeLimit = Math.floor(blocks.length * timeMultiplier);
            if (level <= 2) timeLimit = 60;
            if (timeLimit < 25) timeLimit = 25;
            if (timeLimit > 110 && level > 2) timeLimit = 110;`;
html = html.replace(oldTimeLogic, newTimeLogic);

// 3. Bottom Nav Icon
html = html.replace(
    /<i class="fas fa-home nav-icon"><\/i>/g,
    `<i class="fas fa-cube nav-icon animated-cube"></i>`
);
// And insert the animated-cube CSS
if (!html.includes('animated-cube')) {
    html = html.replace('</style>', `
        @keyframes floatCube {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-3px); }
            100% { transform: translateY(0px); }
        }
        .animated-cube {
            animation: floatCube 3s ease-in-out infinite;
        }
    </style>`);
}

// 4. Modal Background Closing for Tabs
html = html.replace(
    /<div id="shop-screen">/g,
    `<div id="shop-screen" onclick="if(event.target === this) switchTab('HOME')">`
);
html = html.replace(
    /<div id="profile-screen">/g,
    `<div id="profile-screen" onclick="if(event.target === this) switchTab('HOME')">`
);

// 5. Player Name Modal Logic
html = html.replace(
    /<div class="shop-item" style="flex-direction: column; align-items: stretch; gap: 8px; margin-bottom: 15px; padding: 15px; background: rgba\(255,255,255,1\); border: 2px solid #dfe6e9;">\s*<span class="shop-item-name" style="text-align:center; font-size:16px; color:#2d3436; font-weight:bold;">Oyuncu Adı<\/span>\s*<input type="text" id="input-player-name"[^>]*>\s*<button class="shop-item-btn"[^>]*>KAYDET<\/button>\s*<\/div>/g,
    `<div class="shop-item" style="flex-direction: row; justify-content: space-between; align-items: center; padding: 15px; margin-bottom: 15px; border: 2px solid #dfe6e9; border-radius: 12px; background: white;">
        <div style="display:flex; flex-direction:column; gap:4px; text-align:left;">
            <span style="font-size:14px; color:#636e72;">Oyuncu Adı</span>
            <span id="display-player-name" style="font-size:16px; font-weight:bold; color:#2d3436;"></span>
        </div>
        <div style="cursor:pointer; font-size:20px; padding:8px;" onclick="openPlayerNameModal()">✏️</div>
    </div>`
);

// Insert Player Name Modal HTML at the end of body
if (!html.includes('player-name-modal')) {
    let playerNameModalHtml = `
    <div id="player-name-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); backdrop-filter: blur(5px); z-index: 350; flex-direction: column; justify-content: center; align-items: center; pointer-events: auto;" onclick="if(event.target === this) closePlayerNameModal()">
        <div style="background: white; padding: 25px; border-radius: 20px; width: 90%; max-width: 300px; text-align: center; box-shadow: 0 20px 50px rgba(0,0,0,0.2);">
            <h3 style="margin-top:0; color:#2d3436;">Oyuncu Adını Değiştir</h3>
            <input type="text" id="modal-input-player-name" placeholder="Adınız" style="width:100%; box-sizing:border-box; padding: 12px; border: 2px solid #dfe6e9; border-radius: 8px; font-weight: bold; font-size:16px; outline:none; text-align:center; margin-bottom: 15px;" maxlength="16">
            <div style="display:flex; gap:10px;">
                <button style="flex:1; padding:12px; background:#dfe6e9; color:#2d3436; border:none; border-radius:8px; font-weight:bold; cursor:pointer;" onclick="closePlayerNameModal()">Vazgeç</button>
                <button style="flex:1; padding:12px; background:#0984e3; color:white; border:none; border-radius:8px; font-weight:bold; cursor:pointer;" onclick="savePlayerNameFromModal()">Kaydet</button>
            </div>
        </div>
    </div>
    <script>
        function openPlayerNameModal() {
            document.getElementById('modal-input-player-name').value = window.playerName;
            document.getElementById('player-name-modal').style.display = 'flex';
        }
        function closePlayerNameModal() {
            document.getElementById('player-name-modal').style.display = 'none';
        }
        function savePlayerNameFromModal() {
            let rawVal = document.getElementById('modal-input-player-name').value;
            let val = rawVal.trim();
            if(val.length < 3) {
                alert("Oyuncu adı en az 3 karakter olmalıdır.");
                return;
            }
            if(val.length > 16) {
                alert("Oyuncu adı en fazla 16 karakter olmalıdır.");
                return;
            }
            if(val.toLowerCase() === window.playerName.toLowerCase()) {
                alert("Bu ismi zaten kullanıyorsunuz.");
                return;
            }
            window.playerName = val;
            localStorage.setItem('cubix_playerName', window.playerName);
            let pnDisp = document.getElementById('display-player-name');
            if(pnDisp) pnDisp.innerText = window.playerName;
            let profDisp = document.getElementById('profile-name');
            if(profDisp) profDisp.innerText = window.playerName;
            closePlayerNameModal();
        }
    </script>
</body>`;
    html = html.replace('</body>', playerNameModalHtml);
}

// Ensure the new player name is shown in settings on load
html = html.replace(
    /let pnInput = document\.getElementById\('input-player-name'\);\s*if\(pnInput\) pnInput\.value = playerName;/g,
    `let pnDisp = document.getElementById('display-player-name');
            if(pnDisp) pnDisp.innerText = playerName;`
);

// Add the player name modal to the Back button listener
html = html.replace(
    /let avatar = document\.getElementById\('avatar-selection-card'\);/g,
    `let avatar = document.getElementById('avatar-selection-card');
            let pnModal = document.getElementById('player-name-modal');`
);
html = html.replace(
    /else if \(avatar && avatar\.style\.display !== 'none'\) \{\s*closeAvatarSelection\(\);\s*\}/g,
    `else if (avatar && avatar.style.display !== 'none') {
                closeAvatarSelection();
            } else if (pnModal && pnModal.style.display !== 'none') {
                closePlayerNameModal();
            }`
);

// 6. Fix watchDailyAd logic
let oldWatchDailyAdRegex = /window\.watchDailyAd = async function\(\) \{[\s\S]*?function giveExtraTime\(\) \{/;
let newWatchDailyAd = `window.watchDailyAd = async function() {
        let data = getDailyAdData();
        if (data.count >= 3) return;
        
        let rewards = [500, 750, 1250];
        let rewardAmount = rewards[data.count];
        
        let btn = document.getElementById('btn-watch-daily-ad');
        if(btn) {
            btn.innerText = "Yükleniyor...";
            btn.style.pointerEvents = "none";
        }
        
        const handleRewardSuccess = () => {
            if (window.isDailyRewardProcessed) return;
            window.isDailyRewardProcessed = true;
            
            data.count++;
            localStorage.setItem('cubix_dailyAdCount', data.count);
            gold += rewardAmount;
            localStorage.setItem('arrowMaze_gold', gold);
            let hudGoldEl = document.getElementById('hud-gold-amount');
            if(hudGoldEl) hudGoldEl.innerText = gold;
            if(typeof SoundEngine !== 'undefined') SoundEngine.playCoin();
            
            console.log("Gold Kazan reward callback geldi");
            console.log("Gold ödülü verildi: +" + rewardAmount);
            console.log("Günlük sayaç: " + data.count + "/3");
            
            openGoldModal(); 
        };
        
        if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.AdMob) {
            const AdMob = window.Capacitor.Plugins.AdMob;
            try {
                window.isDailyRewardProcessed = false;
                console.log("Gold Kazan reklam yüklendi");
                
                if (window.dailyRewardListener) { await window.dailyRewardListener.remove(); window.dailyRewardListener = null; }
                if (window.dailyDismissListener) { await window.dailyDismissListener.remove(); window.dailyDismissListener = null; }
                if (window.dailyLoadListener) { await window.dailyLoadListener.remove(); window.dailyLoadListener = null; }
                if (window.dailyFailedLoadListener) { await window.dailyFailedLoadListener.remove(); window.dailyFailedLoadListener = null; }
                
                window.dailyRewardListener = await AdMob.addListener('onRewardedVideoAdReward', () => {
                    handleRewardSuccess();
                });
                
                window.dailyDismissListener = await AdMob.addListener('onRewardedVideoAdDismissed', async () => {
                    if (window.dailyRewardListener) { await window.dailyRewardListener.remove(); window.dailyRewardListener = null; }
                    if (window.dailyDismissListener) { await window.dailyDismissListener.remove(); window.dailyDismissListener = null; }
                    if (window.dailyLoadListener) { await window.dailyLoadListener.remove(); window.dailyLoadListener = null; }
                    if (window.dailyFailedLoadListener) { await window.dailyFailedLoadListener.remove(); window.dailyFailedLoadListener = null; }
                    
                    if (!window.isDailyRewardProcessed) {
                        openGoldModal(); 
                    }
                });
                
                window.dailyLoadListener = await AdMob.addListener('onRewardedVideoAdLoaded', async () => {
                    console.log("Gold Kazan reklam gösterildi");
                    await AdMob.showRewardVideoAd();
                });
                
                window.dailyFailedLoadListener = await AdMob.addListener('onRewardedVideoAdFailedToLoad', async () => {
                    if (window.dailyRewardListener) { await window.dailyRewardListener.remove(); window.dailyRewardListener = null; }
                    if (window.dailyDismissListener) { await window.dailyDismissListener.remove(); window.dailyDismissListener = null; }
                    if (window.dailyLoadListener) { await window.dailyLoadListener.remove(); window.dailyLoadListener = null; }
                    if (window.dailyFailedLoadListener) { await window.dailyFailedLoadListener.remove(); window.dailyFailedLoadListener = null; }
                    
                    alert("Reklam şu an hazır değil, lütfen daha sonra tekrar deneyin.");
                    openGoldModal();
                });
                
                await AdMob.prepareRewardVideoAd({
                    adId: "ca-app-pub-3940256099942544/5224354917", // Test ID
                    isTesting: true
                });
                
            } catch (e) {
                console.warn("AdMob Hatası:", e);
                alert("Reklam yüklenirken hata oluştu.");
                openGoldModal();
            }
        } else {
            alert("Reklam şu an hazır değil (Test ortamı). Gerçek cihazda ödül alınabilir.");
            openGoldModal();
        }
    };

    function giveExtraTime() {`;

html = html.replace(oldWatchDailyAdRegex, newWatchDailyAd);

fs.writeFileSync('www/index.html', html, 'utf8');
console.log('Applied V5 UI Fixes successfully!');
