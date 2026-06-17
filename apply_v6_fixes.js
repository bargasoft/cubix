const fs = require('fs');
let html = fs.readFileSync('www/index.html', 'utf8');

// 1. Fix Player Name Modal Logic
// The problem was that the injected script used window.playerName, but playerName was defined as a 'let' variable in another script tag, so they were separate.
// We will replace the injected script block.

let oldScript = `<script>
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
    </script>`;

let newScript = `<script>
        function openPlayerNameModal() {
            // playerName is a global let variable from the main script
            document.getElementById('modal-input-player-name').value = playerName;
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
            if(val.toLowerCase() === playerName.toLowerCase()) {
                alert("Bu ismi zaten kullanıyorsunuz.");
                return;
            }
            // Update the global let variable
            playerName = val;
            localStorage.setItem('cubix_playerName', playerName);
            
            let pnDisp = document.getElementById('display-player-name');
            if(pnDisp) pnDisp.innerText = playerName;
            
            let profDisp = document.getElementById('profile-name');
            if(profDisp) profDisp.innerText = playerName;
            
            closePlayerNameModal();
        }
    </script>`;

if (html.includes(oldScript)) {
    html = html.replace(oldScript, newScript);
} else {
    // Let's use regex in case of slight formatting differences
    let regexOldScript = /<script>\s*function openPlayerNameModal\(\) \{[\s\S]*?<\/script>/;
    html = html.replace(regexOldScript, newScript);
}


// 2. Replace Home Emoji with Cube Emoji
html = html.replace(/<div class="nav-icon">🏠<\/div>/g, '<div class="nav-icon animated-cube" style="display:inline-block;">🧊</div>');

// Also safely replace any fa-home just in case
html = html.replace(/<i class="fas fa-home nav-icon"><\/i>/g, '<div class="nav-icon animated-cube" style="display:inline-block;">🧊</div>');

// Just in case we missed the top-left button, let's change 🏠 Menü to ⬅️ Menü to be 100% free of homes.
html = html.replace(/🏠 Menü/g, '⬅️ Menü');

fs.writeFileSync('www/index.html', html, 'utf8');
console.log('Applied V6 UI Fixes successfully!');
