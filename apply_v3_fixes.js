const fs = require('fs');
let html = fs.readFileSync('www/index.html', 'utf8');

// 1. Fix Profile UI update crash (Remove document.getElementById('stat-ads'))
html = html.replace(
    /document\.getElementById\('stat-ads'\)\.innerText = ads;/g,
    `// document.getElementById('stat-ads').innerText = ads; // Removed to prevent null reference crash`
);

// 2. Fix Market Header
html = html.replace(
    /<h3 style="color:#2d3436; margin-bottom: 15px; text-align:center;">Market Kategorileri<\/h3>/g,
    `<h3 style="color:#2d3436; margin-bottom: 15px; text-align:center; font-size:20px;">Market</h3>`
);

// 3. Fix Settings Player Name Input UI
html = html.replace(
    /<input type="text" id="input-player-name" placeholder="Adınız"[^>]*>\s*<button class="shop-item-btn" style="background:#0984e3; color:white; width:100%; padding:12px; font-size:16px;" onclick="savePlayerName\(\)">KAYDET<\/button>/,
    `<div style="display:flex; gap:8px;">
        <input type="text" id="input-player-name" placeholder="Adınız" style="flex:1; padding: 8px 12px; border: 2px solid #dfe6e9; border-radius: 8px; font-weight: bold; font-size:14px; outline:none;" maxlength="15">
        <button class="shop-item-btn" style="background:#0984e3; color:white; padding:8px 16px; font-size:14px; border-radius:8px; font-weight:bold; cursor:pointer; border:none;" onclick="savePlayerName()">KAYDET</button>
    </div>`
);

// Optional: fix the containing div of settings name
html = html.replace(
    /<div class="shop-item" style="flex-direction: column; align-items: stretch; gap: 10px; margin-bottom: 15px;">\s*<span class="shop-item-name" style="text-align:left;">Oyuncu Adı<\/span>/,
    `<div class="shop-item" style="flex-direction: column; align-items: stretch; gap: 6px; margin-bottom: 15px; padding: 12px;">
    <span class="shop-item-name" style="text-align:left; font-size:14px; color:#636e72;">Oyuncu Adı</span>`
);

// 4. Update Ad Logic in watchDailyAd()
html = html.replace(
    /window\.watchDailyAd = async function\(\) \{[\s\S]*?function giveExtraTime\(\) \{/,
    `window.watchDailyAd = async function() {
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
        
        if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.AdMob) {
            const AdMob = window.Capacitor.Plugins.AdMob;
            try {
                let hasWatched = false;
                
                if (window.dailyRewardListener) { await window.dailyRewardListener.remove(); window.dailyRewardListener = null; }
                if (window.dailyDismissListener) { await window.dailyDismissListener.remove(); window.dailyDismissListener = null; }
                if (window.dailyLoadListener) { await window.dailyLoadListener.remove(); window.dailyLoadListener = null; }
                if (window.dailyFailedLoadListener) { await window.dailyFailedLoadListener.remove(); window.dailyFailedLoadListener = null; }
                
                window.dailyRewardListener = await AdMob.addListener('onRewardedVideoAdReward', () => {
                    hasWatched = true;
                });
                
                window.dailyDismissListener = await AdMob.addListener('onRewardedVideoAdDismissed', async () => {
                    if (window.dailyRewardListener) { await window.dailyRewardListener.remove(); window.dailyRewardListener = null; }
                    if (window.dailyDismissListener) { await window.dailyDismissListener.remove(); window.dailyDismissListener = null; }
                    if (window.dailyLoadListener) { await window.dailyLoadListener.remove(); window.dailyLoadListener = null; }
                    if (window.dailyFailedLoadListener) { await window.dailyFailedLoadListener.remove(); window.dailyFailedLoadListener = null; }
                    
                    if (hasWatched) {
                        handleRewardSuccess();
                    } else {
                        openGoldModal(); // Reset modal state if dismissed without reward
                    }
                });
                
                window.dailyLoadListener = await AdMob.addListener('onRewardedVideoAdLoaded', async () => {
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
                alert("Reklam yüklenirken bir hata oluştu.");
                openGoldModal();
            }
        } else {
            // SIMULATION REMOVED FOR APK INTEGRITY
            alert("Reklam şu an hazır değil (Test ortamı). Gerçek cihazda ödül alınabilir.");
            openGoldModal();
        }
    };

    function giveExtraTime() {`
);

fs.writeFileSync('www/index.html', html, 'utf8');
console.log('V3 UI Fixes Applied Successfully!');
