const fs = require('fs');
let html = fs.readFileSync('www/index.html', 'utf8');

// 1. Settings / Player Name Input Overflow:
html = html.replace(
    /<div class="shop-item" style="flex-direction: column; align-items: stretch; gap: 6px; margin-bottom: 15px; padding: 12px;">\s*<span class="shop-item-name"[^>]*>Oyuncu Adı<\/span>\s*<div style="display:flex; gap:8px;">\s*<input type="text" id="input-player-name"[^>]*>\s*<button class="shop-item-btn"[^>]*>KAYDET<\/button>\s*<\/div>\s*<\/div>/g,
    `<div class="shop-item" style="flex-direction: column; align-items: stretch; gap: 8px; margin-bottom: 15px; padding: 15px; background: rgba(255,255,255,1); border: 2px solid #dfe6e9;">
    <span class="shop-item-name" style="text-align:center; font-size:16px; color:#2d3436; font-weight:bold;">Oyuncu Adı</span>
    <input type="text" id="input-player-name" placeholder="Adınız" style="width:100%; box-sizing:border-box; padding: 12px; border: 2px solid #dfe6e9; border-radius: 8px; font-weight: bold; font-size:16px; outline:none; text-align:center;" maxlength="15">
    <button class="shop-item-btn" style="background:#0984e3; color:white; width:100%; padding:12px; font-size:16px; border-radius:8px; font-weight:bold; cursor:pointer; border:none;" onclick="savePlayerName()">KAYDET</button>
</div>`
);

// 2. Market Screen (No Transparency / Clashing):
// Ensure the container for shop cards is opaque. Wait, let's wrap shop-items-container items in JS? 
// No, the shop-items-container itself doesn't have a background. Let's give it one.
html = html.replace(
    /<div id="shop-items-container"><\/div>/g,
    `<div style="background: rgba(255, 255, 255, 0.95); padding: 20px; border-radius: 15px; box-shadow: 0 8px 30px rgba(0,0,0,0.2); width: 100%; box-sizing: border-box; max-height: 75vh; overflow-y: auto;">
        <div id="shop-items-container"></div>
    </div>`
);
// Also change the title to just "Market" and center it nicely.
// Wait, I already changed it to "Market". Let's verify what it looks like.
html = html.replace(
    /<h3 style="color:#2d3436; margin-bottom: 15px; text-align:center; font-size:20px;">Market<\/h3>/g,
    `<h3 style="color:#2d3436; margin-bottom: 20px; text-align:center; font-size:24px; font-weight:bold;">Market</h3>`
);

// Make sure individual shop cards are solid.
// In updateShopUI():
html = html.replace(
    /let html = `<div style="width: 90%; max-width: 400px; padding-top: 20px;">`;/g,
    `let html = \`<div style="width: 90%; max-width: 400px; padding-top: 20px;">\`;`
);

// 3. Close Modal on Outside Click
// Avatar Selection
html = html.replace(
    /<div id="avatar-selection-card"([^>]*)>/g,
    (match, p1) => {
        if (!match.includes('onclick=')) return `<div id="avatar-selection-card"${p1} onclick="if(event.target === this) closeAvatarSelection()">`;
        return match;
    }
);

// Gold Reward Modal
html = html.replace(
    /<div id="gold-reward-modal"([^>]*)>/g,
    (match, p1) => {
        if (!match.includes('onclick=')) return `<div id="gold-reward-modal"${p1} onclick="if(event.target === this) closeGoldModal()">`;
        return match;
    }
);

// Settings Screen
html = html.replace(
    /<div id="settings-screen"([^>]*)>/g,
    (match, p1) => {
        if (!match.includes('onclick=')) return `<div id="settings-screen"${p1} onclick="if(event.target === this) closeSettings()">`;
        return match;
    }
);

// 4. "Ana Ekran" -> "Merkez"
html = html.replace(
    /<div class="nav-text">Ana Ekran<\/div>/g,
    `<div class="nav-text">Merkez</div>`
);

// 5. Capacitor Back Button Support
html = html.replace(
    /document\.addEventListener\('DOMContentLoaded', async \(\) => \{/g,
    `document.addEventListener('DOMContentLoaded', async () => {
    
    // Android Back Button Behavior
    if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App) {
        window.Capacitor.Plugins.App.addListener('backButton', () => {
            let settings = document.getElementById('settings-screen');
            let gold = document.getElementById('gold-reward-modal');
            let avatar = document.getElementById('avatar-selection-card');
            
            if (settings && settings.style.display !== 'none') {
                closeSettings();
            } else if (gold && gold.style.display !== 'none') {
                closeGoldModal();
            } else if (avatar && avatar.style.display !== 'none') {
                closeAvatarSelection();
            } else {
                if (window.currentTab !== 'HOME') {
                    switchTab('HOME');
                } else {
                    window.Capacitor.Plugins.App.exitApp();
                }
            }
        });
    }
`
);

// Optional: Fix profile card transparency if it's too transparent.
html = html.replace(
    /\.profile-card \{\s*background: rgba\(255, 255, 255, 0\.9\);/g,
    `.profile-card {
            background: rgba(255, 255, 255, 0.95);`
);

fs.writeFileSync('www/index.html', html, 'utf8');
console.log('Applied V4 UI Fixes successfully!');
