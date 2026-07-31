import DB from '../data/db.js';
import { showSnackbar } from '../utils/helpers.js';

const Settings = {
    async render() {
        return `
            <h1>Paramètres</h1>
            <div class="card">
                <h3>Profil IDEL</h3>
                <input type="text" class="input-field" id="set-rpps" placeholder="Numéro RPPS">
                <input type="text" class="input-field" id="set-adeli" placeholder="Numéro ADELI">
                <input type="text" class="input-field" id="set-tarif" placeholder="Tarif journalier (€)">
                <input type="text" class="input-field" id="set-km" placeholder="Tarif kilométrique (€)">
                <button class="btn" id="save-profile">Sauvegarder</button>
            </div>
            
            <div class="card">
                <h3>Apparence</h3>
                <button class="btn-outline" id="theme-toggle">Mode Sombre / Clair</button>
            </div>

            <div class="card">
                <h3>Données</h3>
                <button class="btn-outline" id="export-btn" style="margin-bottom:10px;">Exporter (JSON)</button>
                <input type="file" id="import-file" accept=".json" style="display:none;">
                <button class="btn-outline" id="import-btn">Importer (JSON)</button>
            </div>
        `;
    },

    init() {
        // Theme toggle
        document.getElementById('theme-toggle').addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });

        // Export
        document.getElementById('export-btn').addEventListener('click', async () => {
            const data = await DB.exportAll();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `rempla_idel_backup_${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            showSnackbar('Sauvegarde exportée');
        });

        // Import
        document.getElementById('import-btn').addEventListener('click', () => {
            document.getElementById('import-file').click();
        });
        document.getElementById('import-file').addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                const text = await file.text();
                await DB.importAll(JSON.parse(text));
                showSnackbar('Données restaurées avec succès');
                setTimeout(() => location.reload(), 1500);
            }
        });
    }
};

export default Settings;
