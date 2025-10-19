let installPromptEvent = null;

function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js')
            .then(reg => console.log('Service Worker registered', reg))
            .catch(err => console.error('Service Worker registration failed', err));
    }
}

function setupInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (event) => {
        // Prevent the mini-infobar from appearing on mobile
        event.preventDefault();
        // Stash the event so it can be triggered later.
        installPromptEvent = event;
        // Update UI to notify the user they can install the PWA
        const installBtn = document.getElementById('installBtn');
        if (installBtn) {
            installBtn.style.display = 'inline-block'; // Use inline-block for landing page
        }
    });
}

async function installApp() {
    if (!installPromptEvent) return;
    const result = await installPromptEvent.prompt();
    console.log(`Install prompt result: ${result.outcome}`);
    installPromptEvent = null;
}