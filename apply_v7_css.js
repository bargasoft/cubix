const fs = require('fs');
let html = fs.readFileSync('www/index.html', 'utf8');

const responsiveCSS = `
        /* ================= RESPONSIVE FIXES ================= */
        /* Ensure modals and panels don't overflow on small screens and remain centered/proportional */
        .modal-content, 
        .profile-card, 
        #victory-screen, 
        #gameover-screen, 
        #player-name-modal > div,
        #avatar-selection-card {
            width: min(92vw, 420px) !important;
            max-height: 85vh !important;
            overflow-y: auto !important;
            box-sizing: border-box !important;
        }

        /* Specifically target Gold Modal inner container if it exists */
        #gold-modal > div {
            width: min(92vw, 420px) !important;
            max-height: 85vh !important;
            overflow-y: auto !important;
            box-sizing: border-box !important;
        }

        /* Prevent body scrolling entirely, handle inside modals */
        body {
            overflow: hidden !important;
            width: 100vw;
            height: 100vh;
        }

        /* Tablet bottom nav optimization */
        #bottom-nav {
            max-width: 600px;
            margin: 0 auto;
            left: 50%;
            transform: translateX(-50%);
            border-top-left-radius: 30px;
            border-top-right-radius: 30px;
        }
        
        /* Ensure logo fits on very small devices */
        @media (max-width: 380px) {
            .menu-title { font-size: 10vw; top: 12%; }
            .play-big-btn { padding: 12px 30px; font-size: 20px; }
            #gold-text { font-size: 12px; padding: 5px 10px; }
            #btn-home, #btn-hamburger { font-size: 12px; padding: 5px 10px; }
        }
        
        /* Fix for Settings Modal if it uses different classes */
        #settings-screen > div {
            width: min(92vw, 420px) !important;
            max-height: 85vh !important;
            overflow-y: auto !important;
            box-sizing: border-box !important;
        }
`;

if (!html.includes('/* ================= RESPONSIVE FIXES ================= */')) {
    html = html.replace('</style>', responsiveCSS + '\n    </style>');
    fs.writeFileSync('www/index.html', html, 'utf8');
    console.log("Responsive CSS injected successfully.");
} else {
    console.log("Responsive CSS already exists.");
}

