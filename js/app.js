import Layout from './components/layout.js';

// Init Theme
const savedTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);

// PWA Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js').catch(err => console.log('SW registration failed: ', err));
    });
}

// Init App
Layout.renderNav();
Layout.navigate('dashboard');
