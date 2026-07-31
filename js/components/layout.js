import Dashboard from './dashboard.js';
import Planning from './planning.js';
import Cabinets from './cabinets.js';
import Settings from './settings.js';
import AI from '../utils/ai.js';

const routes = {
    dashboard: Dashboard.render,
    planning: Planning.render,
    cabinets: Cabinets.render,
    settings: Settings.render,
    // Les autres vues (revenus, notes, etc.) suivent le même pattern
};

const Layout = {
    renderNav() {
        const nav = document.getElementById('bottom-nav');
        nav.innerHTML = `
            <button class="nav-item active" data-route="dashboard"><i data-lucide="home"></i>Accueil</button>
            <button class="nav-item" data-route="planning"><i data-lucide="calendar"></i>Planning</button>
            <button class="nav-item" data-route="cabinets"><i data-lucide="building-2"></i>Cabinets</button>
            <button class="nav-item" data-route="settings"><i data-lucide="settings"></i>Réglages</button>
        `;
        nav.querySelectorAll('.nav-item').forEach(btn => {
            btn.addEventListener('click', () => this.navigate(btn.dataset.route));
        });
    },

    async navigate(route) {
        document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-route="${route}"]`).classList.add('active');
        
        const main = document.getElementById('main-content');
        main.innerHTML = `<div class="loader">Chargement...</div>`;
        
        const renderFunction = routes[route] || Dashboard.render;
        main.innerHTML = await renderFunction();
        
        if (window.lucide) lucide.createIcons();
        
        // Attachement des events spécifiques à la vue
        if (route === 'dashboard') Dashboard.init();
        if (route === 'planning') Planning.init();
        if (route === 'cabinets') Cabinets.init();
        if (route === 'settings') Settings.init();
    }
};

export default Layout;
