// Loading Manager Module
export class LoadingManager {
    // Hide loading screen and show content
    hideLoadingScreen(success = true) {
        const loadingScreen = document.getElementById('loading-screen');
        const container = document.querySelector('.container');

        if (loadingScreen) {
            loadingScreen.style.pointerEvents = 'none';
        }

        if (success) {
            // Add a small delay to ensure all content has been rendered
            setTimeout(() => {
                if (loadingScreen) loadingScreen.classList.add('hidden');
                if (container) {
                    container.classList.remove('content-hidden');
                    container.classList.add('content-visible');
                }
                // Remove fixed overlay from layout after fade — fixes iOS Safari scroll stuck on invisible layer
                setTimeout(() => {
                    if (loadingScreen) {
                        loadingScreen.style.display = 'none';
                        loadingScreen.setAttribute('aria-hidden', 'true');
                    }
                }, 600);
            }, 500);
        } else {
            if (loadingScreen) loadingScreen.classList.add('hidden');
            if (container) {
                container.classList.remove('content-hidden');
                container.classList.add('content-visible');
            }
            setTimeout(() => {
                if (loadingScreen) {
                    loadingScreen.style.display = 'none';
                    loadingScreen.setAttribute('aria-hidden', 'true');
                }
            }, 600);
        }
    }
}
