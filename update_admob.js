const fs = require('fs');
let html = fs.readFileSync('www/index.html', 'utf8');

// Replace isTesting: true with isTesting: false
html = html.replace(/isTesting:\s*true/g, 'isTesting: false');

// Replace Test Ad Unit IDs
// Banner
html = html.replace(/ca-app-pub-3940256099942544\/6300978111/g, 'YOUR_ADMOB_BANNER_ID_HERE');
// Interstitial
html = html.replace(/ca-app-pub-3940256099942544\/1033173712/g, 'YOUR_ADMOB_INTERSTITIAL_ID_HERE');
// Rewarded
html = html.replace(/ca-app-pub-3940256099942544\/5224354917/g, 'YOUR_ADMOB_REWARDED_ID_HERE');

fs.writeFileSync('www/index.html', html, 'utf8');
console.log('AdMob Test IDs removed.');
