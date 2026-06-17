const fs = require('fs');
let html = fs.readFileSync('www/index.html', 'utf8');

// 1. Update + button to open Gold Modal
html = html.replace(
    /<div class="hud-gold-plus" onclick="switchTab\('MARKET'\)">\+<\/div>/,
    `<div class="hud-gold-plus" onclick="openGoldModal()">+</div>`
);

// 2. Add Gold Modal HTML before Settings Screen
html = html.replace(
    /<div id="settings-screen">/,
    `<div id="gold-reward-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(5px); z-index: 250; flex-direction: column; justify-content: center; align-items: center; pointer-events: auto;">
        <div style="background: white; padding: 25px; border-radius: 20px; width: 90%; max-width: 320px; text-align: center; box-shadow: 0 20px 50px rgba(0,0,0,0.2);">
            <h2 style="margin-top:0; color:#f1c40f; font-weight:900; font-size: 26px;">Gold Kazan 🪙</h2>
            <p style="color:#2d3436; font-size:15px; font-weight:bold; margin-bottom:20px;">Reklam izle, günlük Gold ödülünü al.</p>
            <div id="daily-ad-info" style="margin-bottom:20px; font-weight:bold; color:#0984e3; background:#eaf2f8; padding:10px; border-radius:10px;">
                Bugünkü hak: 0/3
            </div>
            <button id="btn-watch-daily-ad" onclick="watchDailyAd()" style="padding: 15px 25px; font-size: 16px; font-weight: bold; background: linear-gradient(45deg, #2ed573, #1dd1a1); color: white; border: none; border-radius: 12px; cursor: pointer; box-shadow: 0 4px 10px rgba(46, 213, 115, 0.4); width: 100%; margin-bottom:10px;">📺 Reklam İzle</button>
            <button onclick="closeGoldModal()" style="padding: 12px 20px; font-weight: bold; background: #dfe6e9; border: none; border-radius: 12px; cursor: pointer; color: #2d3436; width: 100%;">Kapat</button>
        </div>
    </div>
    <div id="settings-screen">`
);

// 3. Fix Settings Player Name Input Layout
html = html.replace(
    /<div style="display:flex; gap:10px;">\s*<input type="text" id="input-player-name"[^>]*>\s*<button class="shop-item-btn"[^>]*>KAYDET<\/button>\s*<\/div>/,
    `<input type="text" id="input-player-name" placeholder="Adınız" style="width:100%; box-sizing:border-box; padding: 12px; border: 2px solid #dfe6e9; border-radius: 8px; font-weight: bold;" maxlength="15">
                    <button class="shop-item-btn" style="background:#0984e3; color:white; width:100%; padding:12px; font-size:16px;" onclick="savePlayerName()">KAYDET</button>`
);

// 4. Update Shop UI (Remove Avatars from Market)
html = html.replace(
    /function updateShopUI\(\) \{[\s\S]*?window\.showShopCategory =/m,
    `function updateShopUI() {
        let container = document.getElementById('shop-items-container');
        container.innerHTML = \`
            <div style="width: 90%; max-width: 400px; padding-top: 20px;">
                <h3 style="color:#2d3436; margin-bottom: 15px; text-align:center;">Market Kategorileri</h3>
                <div class="shop-item" onclick="showShopCategory('cubes')" style="cursor:pointer; background:#fff; border-left: 4px solid #0984e3;">
                    <span class="shop-item-name" style="font-size:18px;">🧊 Küpler</span>
                    <span style="font-size:20px;">➔</span>
                </div>
                <div class="shop-item" style="opacity: 0.6; background:#f1f2f6; cursor:default;" onclick="alert('Bu özellik çok yakında eklenecek.')">
                    <span class="shop-item-name" style="font-size:18px;">🖼️ Temalar</span>
                    <span style="font-size:14px; color:#e74c3c; font-weight:bold;">Yakında</span>
                </div>
                <div class="shop-item" style="opacity: 0.6; background:#f1f2f6; cursor:default;" onclick="alert('Bu özellik çok yakında eklenecek.')">
                    <span class="shop-item-name" style="font-size:18px;">✨ Efektler</span>
                    <span style="font-size:14px; color:#e74c3c; font-weight:bold;">Yakında</span>
                </div>
                <div class="shop-item" style="opacity: 0.6; background:#f1f2f6; cursor:default;" onclick="alert('Bu özellik çok yakında eklenecek.')">
                    <span class="shop-item-name" style="font-size:18px;">💎 Prime</span>
                    <span style="font-size:14px; color:#e74c3c; font-weight:bold;">Yakında</span>
                </div>
            </div>
        \`;
    }
    
    window.showShopCategory =`
);

// 5. Replace Old Ad Logic with new Daily Ad Logic
html = html.replace(
    /async function watchAdForGold\(\) \{[\s\S]*?function giveExtraTime\(\) \{/,
    `function getDailyAdData() {
        let dateStr = new Date().toISOString().split('T')[0];
        let savedDate = localStorage.getItem('cubix_dailyAdDate');
        let count = parseInt(localStorage.getItem('cubix_dailyAdCount')) || 0;
        
        if (savedDate !== dateStr) {
            count = 0;
            localStorage.setItem('cubix_dailyAdDate', dateStr);
            localStorage.setItem('cubix_dailyAdCount', count);
        }
        return { count, dateStr };
    }

    window.openGoldModal = function() {
        let data = getDailyAdData();
        let infoEl = document.getElementById('daily-ad-info');
        let btnAd = document.getElementById('btn-watch-daily-ad');
        
        if(infoEl) infoEl.innerText = \`Bugünkü hak: \${data.count}/3\`;
        
        if(btnAd) {
            if (data.count >= 3) {
                btnAd.style.opacity = '0.5';
                btnAd.style.pointerEvents = 'none';
                btnAd.innerText = 'Bugünkü hakların doldu';
            } else {
                btnAd.style.opacity = '1';
                btnAd.style.pointerEvents = 'auto';
                let rewards = [500, 750, 1250];
                btnAd.innerText = \`📺 Reklam İzle (+\${rewards[data.count]} 🪙)\`;
            }
        }
        
        let modal = document.getElementById('gold-reward-modal');
        if(modal) modal.style.display = 'flex';
    };

    window.closeGoldModal = function() {
        let modal = document.getElementById('gold-reward-modal');
        if(modal) modal.style.display = 'none';
    };

    let dailyAdListener = null;

    window.watchDailyAd = async function() {
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
            data.count++;
            localStorage.setItem('cubix_dailyAdCount', data.count);
            gold += rewardAmount;
            localStorage.setItem('arrowMaze_gold', gold);
            let hudGoldEl = document.getElementById('hud-gold-amount');
            if(hudGoldEl) hudGoldEl.innerText = gold;
            if(typeof SoundEngine !== 'undefined') SoundEngine.playCoin();
            openGoldModal(); 
        };
        
        if (typeof AdMob !== 'undefined') {
            try {
                if (dailyAdListener) { await dailyAdListener.remove(); dailyAdListener = null; }
                
                dailyAdListener = await AdMob.addListener('onRewardedVideoAdReward', async () => {
                    if (dailyAdListener) { await dailyAdListener.remove(); dailyAdListener = null; }
                    handleRewardSuccess();
                });
                
                let failedListener = await AdMob.addListener('onRewardedVideoAdFailedToLoad', async () => {
                    if (dailyAdListener) { await dailyAdListener.remove(); dailyAdListener = null; }
                    if (failedListener) { await failedListener.remove(); failedListener = null; }
                    alert("Reklam şu an hazır değil, lütfen daha sonra tekrar deneyin.");
                    openGoldModal();
                });
                
                await AdMob.prepareRewardVideoAd({ adId: "ca-app-pub-3940256099942544/5224354917", isTesting: true });
                await AdMob.showRewardVideoAd();
                if (failedListener) { await failedListener.remove(); failedListener = null; }
            } catch (e) {
                console.warn("AdMob Error:", e);
                alert("Reklam gösterilirken bir hata oluştu. (Test ortamındaysanız AdMob plugin aktif olmayabilir)");
                openGoldModal();
            }
        } else {
            // Web Simulation Fallback
            setTimeout(() => {
                handleRewardSuccess();
            }, 1000);
        }
    };

    function giveExtraTime() {`
);

fs.writeFileSync('www/index.html', html, 'utf8');
console.log('V2 UI Fixes Applied Successfully!');
